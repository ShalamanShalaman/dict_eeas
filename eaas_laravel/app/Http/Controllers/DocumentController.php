<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Document;
use App\Models\SharedPdf;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Helpers\LogHelper;
use Symfony\Component\Process\Process;

class DocumentController extends Controller
{
    /**
     * Create a notification for a user
     */
    private function createNotification($userId, $type, $title, $message, $documentId = null, $data = null)
    {
        return Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'document_id' => $documentId,
            'data' => $data,
            'is_read' => false,
        ]);
    }

    private function runPythonScript($action, $data)
    {
        $pythonDirName = 'eaas_python';
        $workingDir = false;

        $searchPaths = [
            base_path('..' . DIRECTORY_SEPARATOR . $pythonDirName),
            base_path($pythonDirName),
            dirname(base_path()) . DIRECTORY_SEPARATOR . $pythonDirName
        ];

        foreach ($searchPaths as $path) {
            if (is_dir($path) && file_exists($path . DIRECTORY_SEPARATOR . 'cli.py')) {
                $workingDir = realpath($path);
                break;
            }
        }

        if ($workingDir === false) {
            throw new \Exception("Python directory 'eaas_python' containing 'cli.py' not found.");
        }
        
        $cliPath = $workingDir . DIRECTORY_SEPARATOR . 'cli.py';

        $data = $this->sanitizeNulls($data);

        $tempPayload = tempnam(sys_get_temp_dir(), 'payload_') . '.json';
        file_put_contents($tempPayload, json_encode($data));

        $env = getenv();
        if (!is_array($env)) $env = [];
        
        if (empty($env['SystemRoot'])) {
            $env['SystemRoot'] = isset($_SERVER['SystemRoot']) ? $_SERVER['SystemRoot'] : 'C:\\Windows';
        }
        if (empty($env['PATH'])) {
            $env['PATH'] = isset($_SERVER['PATH']) ? $_SERVER['PATH'] : '';
        }

        $process = new Process(['python', $cliPath, $action, $tempPayload], $workingDir, $env);
        $process->setTimeout(180);
        $process->run();

        @unlink($tempPayload);

        if (!$process->isSuccessful()) {
            throw new \Exception("Python Error: " . $process->getErrorOutput());
        }

        $outputStr = $process->getOutput();
        $output = json_decode($outputStr, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception("Invalid JSON from Python: " . $outputStr);
        }

        if (isset($output['error'])) {
            throw new \Exception($output['error']);
        }

        return $output;
    }

    private function sanitizeNulls($data)
    {
        if (is_array($data)) {
            foreach ($data as $key => $value) {
                $data[$key] = $this->sanitizeNulls($value);
            }
            return $data;
        }
        return $data ?? '';
    }

    public function uploadDocument(Request $request)
    {
        $userId = $request->input('user_id');
        if (!$userId) return response()->json(['error' => 'user_id is required'], 400);

        $user = User::where('user_id', $userId)->first();
        if (!$user) return response()->json(['error' => 'User not found'], 404);

        if (!$request->hasFile('file')) return response()->json(['error' => 'No file uploaded'], 400);

        $file = $request->file('file');
        $filename = $request->input('filename') ?: $file->getClientOriginalName();
        $path = $file->storeAs('documents', uniqid() . '_' . $filename, 'public');

        $doc = Document::create([
            'employee_id' => $user->id,
            'file_path' => $path,
            'status' => 'draft',
            'is_draft' => true
        ]);

        LogHelper::log($user->id, 'CREATE', 'Document', "User uploaded a new draft document: '{$filename}'", $doc->id);
        return response()->json(['message' => 'Document uploaded as draft', 'document' => $doc->toArray()], 201);
    }

    public function autosaveDocument(Request $request, $doc_id)
    {
        $doc = Document::findOrFail($doc_id);
        $userId = $request->input('user_id');
        $user = User::where('user_id', $userId)->firstOrFail();

        if ($doc->employee_id !== $user->id) return response()->json(['error' => 'Unauthorized'], 403);

        if ($request->hasFile('file')) {
            if ($doc->file_path && Storage::disk('public')->exists($doc->file_path)) {
                Storage::disk('public')->delete($doc->file_path);
            }
            $file = $request->file('file');
            $filename = $file->getClientOriginalName();
            $path = $file->storeAs('documents', uniqid() . '_' . $filename, 'public');
            $doc->file_path = $path;
        }

        $doc->updated_at = now();
        $doc->is_draft = true;
        $doc->save();

        // Create notification for auto-save
        $this->createNotification(
            $user->id,
            'document_autosaved',
            'Document Auto-saved',
            "Your document has been auto-saved as draft.",
            $doc->id,
            ['document_name' => basename($doc->file_path)]
        );

        $filename = basename($doc->file_path);
        LogHelper::log($user->id, 'UPDATE', 'Document', "User autosaved draft document: '{$filename}'", $doc->id);
        
        return response()->json(['message' => 'Draft autosaved', 'document' => $doc->toArray()]);
    }

    public function submitDocument(Request $request, $doc_id)
    {
        $doc = Document::findOrFail($doc_id);
        $userId = $request->input('user_id');
        $user = User::where('user_id', $userId)->firstOrFail();

        if ($doc->employee_id !== $user->id) return response()->json(['error' => 'Unauthorized'], 403);

        $reviewerId = $request->input('reviewer_id');
        if ($reviewerId) {
            $reviewer = User::where('id', $reviewerId)->where('role', 'reviewer')->where('is_active', true)->first();
            if (!$reviewer) return response()->json(['error' => 'Invalid or inactive reviewer selected'], 400);
        } else {
            $office = $user->officeLocation;
            if (!$office || !$office->reviewer_id) return response()->json(['error' => 'No reviewer assigned for your office.'], 400);
            $reviewer = User::find($office->reviewer_id);
        }

        $doc->reviewer_id = $reviewer->id;
        $doc->status = 'submitted';
        $doc->is_draft = false;
        $doc->submitted_at = now();
        $doc->save();

        // Create notification for the reviewer
        $this->createNotification(
            $reviewer->id,
            'submitted',
            'New Document Submitted',
            "{$user->full_name} submitted a document for your review.",
            $doc->id,
            ['employee_name' => $user->full_name, 'document_name' => basename($doc->file_path)]
        );

        $filename = basename($doc->file_path);
        LogHelper::log($user->id, 'SUBMIT', 'Document', "User submitted document '{$filename}' for approval to Reviewer: {$reviewer->full_name}", $doc->id);
        
        return response()->json(['message' => 'Document submitted', 'document' => $doc->toArray()]);
    }

    public function reviewDocument(Request $request, $doc_id)
    {
        $doc = Document::findOrFail($doc_id);
        $reviewerId = $request->input('reviewer_id') ?? $request->input('user_id');
        $reviewer = User::where('user_id', $reviewerId)->firstOrFail();

        if ($doc->reviewer_id !== $reviewer->id) return response()->json(['error' => 'Unauthorized'], 403);

        $action = $request->input('action') ?? $request->input('status');
        $filename = basename($doc->file_path);
        $employeeName = $doc->employee ? $doc->employee->full_name : 'Unknown Employee';

        if (in_array($action, ['approve', 'approved'])) {
            $doc->status = 'approved';
            $doc->reviewed_at = now();
            $doc->save();

            // Create notification for the employee (document approved)
            $this->createNotification(
                $doc->employee_id,
                'approved',
                'Document Approved',
                "Your document has been approved by {$reviewer->full_name}.",
                $doc->id,
                ['reviewer_name' => $reviewer->full_name, 'document_name' => $filename]
            );

            LogHelper::log($reviewer->id, 'APPROVE', 'Document', "Reviewer approved document '{$filename}' submitted by {$employeeName}.", $doc->id);
            return response()->json(['message' => 'Document approved', 'document' => $doc->toArray()]);
            
        } elseif (in_array($action, ['decline', 'declined'])) {
            $reason = $request->input('reason') ?? $request->input('note', '');
            $doc->status = 'declined';
            $doc->reviewer_note = $reason;
            $doc->reviewed_at = now();
            $doc->save();

            // Create notification for the employee (document declined)
            $this->createNotification(
                $doc->employee_id,
                'declined',
                'Document Declined',
                "Your document has been declined by {$reviewer->full_name}. Reason: {$reason}",
                $doc->id,
                ['reviewer_name' => $reviewer->full_name, 'document_name' => $filename, 'reason' => $reason]
            );

            LogHelper::log($reviewer->id, 'DECLINE', 'Document', "Reviewer declined document '{$filename}' submitted by {$employeeName}. Reason: {$reason}", $doc->id);
            return response()->json(['message' => 'Document declined', 'document' => $doc->toArray()]);
        }
        
        return response()->json(['error' => 'Invalid action'], 400);
    }

    public function getDocumentContent(Request $request, $doc_id)
    {
        $doc = Document::findOrFail($doc_id);
        if (!Storage::disk('public')->exists($doc->file_path)) return response()->json(['error' => 'File not found'], 404);

        if (str_ends_with($doc->file_path, '.json')) {
            $content = Storage::disk('public')->get($doc->file_path);
            return response()->json(json_decode($content, true));
        }
        return response()->json(['error' => 'Not a JSON state file'], 400);
    }

    public function downloadDocument($doc_id)
    {
        $doc = Document::findOrFail($doc_id);
        $path = $doc->review_file_path ?: $doc->file_path;
        if (!Storage::disk('public')->exists($path)) return response()->json(['error' => 'File not found'], 404);
        return response()->download(Storage::disk('public')->path($path));
    }

    public function viewDocument($doc_id)
    {
        $doc = Document::findOrFail($doc_id);
        $path = $doc->review_file_path ?: $doc->file_path;
        if (!Storage::disk('public')->exists($path)) return response()->json(['error' => 'File not found'], 404);
        $fileExt = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        if ($fileExt === 'pdf') return response()->file(Storage::disk('public')->path($path), ['Content-Type' => 'application/pdf']);
        return response()->json(['message' => 'View not supported'], 400);
    }

    public function deleteDocument(Request $request, $doc_id)
    {
        $doc = Document::findOrFail($doc_id);
        $filename = basename($doc->file_path);
        $userId = $request->input('user_id');

        if ($doc->file_path) Storage::disk('public')->delete($doc->file_path);
        if ($doc->review_file_path) Storage::disk('public')->delete($doc->review_file_path);
        
        SharedPdf::where('document_id', $doc->id)->delete();
        $doc->delete();

        LogHelper::log($userId, 'DELETE', 'Document', "This file has been deleted: '{$filename}'", $doc_id);
        
        return response()->json(['message' => 'Document deleted']);
    }

    public function getUserDocuments($user_id)
    {
        $user = User::where('user_id', $user_id)->firstOrFail();
        $docs = Document::where('employee_id', $user->id)
                        ->where('is_shared', false)
                        ->orderBy('updated_at', 'desc')->get();
        return response()->json($docs->map->toArray());
    }

    public function getReviewerDocuments($reviewer_id)
    {
        $reviewer = User::findOrFail($reviewer_id);
        $docs = Document::where('reviewer_id', $reviewer->id)->where('status', 'submitted')->orderBy('submitted_at', 'desc')->get();
        return response()->json($docs->map->toArray());
    }

    public function getReviewerArchive($reviewer_id)
    {
        $docs = Document::where('reviewer_id', $reviewer_id)->whereIn('status', ['approved', 'declined'])->orderBy('updated_at', 'desc')->get();
        return response()->json($docs->map->toArray());
    }

    public function getReviewers()
    {
        $reviewers = User::where('role', 'reviewer')->where('is_active', true)->get();
        return response()->json($reviewers->map(function ($r) {
            return ['id' => $r->id, 'user_id' => $r->user_id, 'full_name' => $r->full_name, 'office_location' => $r->officeLocation ? $r->officeLocation->location : null];
        }));
    }

    public function uploadReviewDocument(Request $request, $doc_id)
    {
        $doc = Document::findOrFail($doc_id);
        $userId = $request->input('user_id');
        $reviewer = User::where('user_id', $userId)->firstOrFail();
        if ($doc->reviewer_id !== $reviewer->id) return response()->json(['error' => 'Unauthorized'], 403);
        if (!$request->hasFile('file')) return response()->json(['error' => 'No file'], 400);

        $file = $request->file('file');
        $path = $file->storeAs('uploads', uniqid() . '_' . $file->getClientOriginalName(), 'public');
        $doc->review_file_path = $path;
        $doc->status = 'approved';
        $doc->reviewed_at = now();
        $doc->save();

        $filename = basename($doc->file_path);
        $employeeName = $doc->employee ? $doc->employee->full_name : 'Unknown Employee';

        // Create notification for the employee (document approved with reviewed file)
        $this->createNotification(
            $doc->employee_id,
            'approved',
            'Document Approved & Signed',
            "Your document has been reviewed and approved by {$reviewer->full_name}.",
            $doc->id,
            ['reviewer_name' => $reviewer->full_name, 'document_name' => $filename]
        );

        LogHelper::log($reviewer->id, 'UPLOAD_REVIEW', 'Document', "Reviewer uploaded a signed copy for document '{$filename}' submitted by {$employeeName}.", $doc->id);
        
        return response()->json(['message' => 'Uploaded', 'document' => $doc->toArray()], 200);
    }

    public function getNotifications($user_id)
    {
        $user = User::where('user_id', $user_id)->firstOrFail();
        
        // Fetch notifications from the new notifications table
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($notif) {
                return [
                    'id' => $notif->id,
                    'document_id' => $notif->document_id,
                    'document_name' => $notif->data['document_name'] ?? null,
                    'title' => $notif->title,
                    'message' => $notif->message,
                    'reviewer_note' => $notif->data['reason'] ?? null,
                    'notification_type' => $notif->type,
                    'is_read' => $notif->is_read,
                    'created_at' => $notif->created_at ? $notif->created_at->toISOString() : null,
                ];
            });

        $unreadCount = Notification::where('user_id', $user->id)->where('is_read', false)->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount
        ], 200);
    }

    public function markNotificationsRead(Request $request, $user_id)
    {
        $user = User::where('user_id', $user_id)->firstOrFail();
        
        // Mark all notifications as read for this user
        Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    public function clearNotifications(Request $request, $user_id)
    {
        $user = User::where('user_id', $user_id)->firstOrFail();
        
        // Delete all notifications for this user
        Notification::where('user_id', $user->id)->delete();

        return response()->json(['message' => 'All notifications cleared']);
    }

    /**
     * Mark a single notification as read
     */
    public function markNotificationRead(Request $request, $notification_id)
    {
        $notification = Notification::findOrFail($notification_id);
        $notification->markAsRead();
        
        return response()->json(['message' => 'Notification marked as read']);
    }

    /**
     * Delete a single notification
     */
    public function deleteNotification(Request $request, $notification_id)
    {
        $notification = Notification::findOrFail($notification_id);
        $notification->delete();
        
        return response()->json(['message' => 'Notification deleted']);
    }

    public function renameDocument(Request $request, $doc_id)
    {
        $doc = Document::findOrFail($doc_id);
        $newFilename = $request->input('filename');
        if (!$newFilename) return response()->json(['error' => 'Required'], 400);
        if (!str_ends_with(strtolower($newFilename), '.pdf')) $newFilename .= '.pdf';

        $oldFilename = basename($doc->file_path);

        if ($doc->file_path && Storage::disk('public')->exists($doc->file_path)) {
            $dir = dirname($doc->file_path);
            $newPath = $dir . '/' . uniqid() . '_' . $newFilename;
            Storage::disk('public')->move($doc->file_path, $newPath);
            $doc->file_path = $newPath;
            $doc->save();

            SharedPdf::where('document_id', $doc->id)->update([
                'file_path' => $newPath,
                'display_name' => $newFilename,
                'updated_at' => now(),
            ]);
            
            $userId = $request->input('user_id');
            $newFilenameBase = basename($newPath);
            LogHelper::log($userId, 'RENAME', 'Document', "Document renamed from '{$oldFilename}' to '{$newFilenameBase}'", $doc->id);
        }
        
        return response()->json(['message' => 'Renamed', 'document' => $doc->toArray(), 'file_path' => ltrim($doc->file_path, '/')]);
    }

    public function uploadSharedPDF(Request $request)
    {
        try {
            $userId = $request->input('user_id');
            $user = User::where('user_id', $userId)->firstOrFail();
            
            // Allow both 'files' and 'files[]' naming conventions
            if (!$request->hasFile('files') && (!$request->hasFile('files[]'))) {
                return response()->json(['error' => 'No files uploaded'], 400);
            }

            $rawFiles = $request->file('files') ?? $request->file('files[]');
            
            // Ensure $files is ALWAYS an array, even if a single file is uploaded
            $files = is_array($rawFiles) ? $rawFiles : [$rawFiles];
            if (count($files) > 5) {
                return response()->json(['error' => 'You can upload up to 5 PDF files at a time.'], 400);
            }

            $tempDirName = 'temp_shared_pdf_' . uniqid();
            $filePaths = [];

            foreach ($files as $file) {
                if ($file && $file->isValid()) {
                    // Only process files that are not empty
                    if ($file->getSize() > 0) {
                        $path = $file->storeAs($tempDirName, $file->getClientOriginalName(), 'local');
                        $filePaths[] = Storage::disk('local')->path($path);
                    }
                }
            }

            if (empty($filePaths)) {
                 return response()->json(['error' => 'No valid files were uploaded. Make sure files are not empty.'], 400);
            }

            // Keep the original uploaded name visible across the app until renamed.
            $displayName = count($files) === 1
                ? $files[0]->getClientOriginalName()
                : ('Merged_' . now()->format('Ymd_His') . '.pdf');
            if (!str_ends_with(strtolower($displayName), '.pdf')) {
                $displayName .= '.pdf';
            }

            $outputFilename = 'shared_' . uniqid() . '_' . ($user->last_name ?: 'AttendancePDF') . '.pdf';
            $publicPath = 'documents/' . $outputFilename;
            $absoluteOutputPath = Storage::disk('public')->path($publicPath);

            $dir = dirname($absoluteOutputPath);
            if (!file_exists($dir)) mkdir($dir, 0755, true);

            $this->runPythonScript('merge_pdfs', [
                'input_files' => $filePaths,
                'output_path' => $absoluteOutputPath
            ]);

            Storage::disk('local')->deleteDirectory($tempDirName);
            
            // Auto-create SHARED document
            $doc = Document::create([
                'employee_id' => $user->id,
                'file_path' => $publicPath,
                'status' => 'shared',
                'is_draft' => false,
                'is_shared' => true
            ]);

            SharedPdf::updateOrCreate(
                ['document_id' => $doc->id],
                [
                    'uploader_id' => $user->id,
                    'uploader_name' => $user->full_name,
                    'office_name' => $user->officeLocation ? $user->officeLocation->location : ($user->office_name ?? null),
                    'file_path' => $publicPath,
                    'display_name' => $displayName,
                ]
            );

            LogHelper::log($user->id, 'CREATE_SHARED', 'Document', "User uploaded shared attendance PDF: '{$outputFilename}'", $doc->id);

            $docArray = $doc->toArray();
            $docArray['employee_name'] = $user->full_name;
            $docArray['display_name'] = $displayName;

            return response()->json([
                'message' => 'Shared PDF uploaded', 
                'file_path' => $publicPath,
                'document' => $docArray
            ], 200);

        } catch (\Exception $e) {
            // Clean up temp directory on failure
            if (isset($tempDirName) && Storage::disk('local')->exists($tempDirName)) {
                Storage::disk('local')->deleteDirectory($tempDirName);
            }
            return response()->json(['error' => 'Upload failed: ' . $e->getMessage()], 500);
        }
    }

    public function listSharedPDFs(Request $request)
    {
        $office = $request->input('office');
        $userId = $request->input('user_id');

        // Fallback: derive office from user when office param is missing on refresh.
        if (!$office && $userId) {
            $user = User::where('user_id', $userId)->first();
            if ($user && $user->officeLocation) {
                $office = $user->officeLocation->location;
            }
        }

        if (!$office) return response()->json([]);

        $sharedRows = SharedPdf::where('office_name', 'like', '%' . $office . '%')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json($sharedRows->map(function ($row) {
            $doc = Document::find($row->document_id);
            if (!$doc) return null;

            $arr = $doc->toArray();
            $arr['id'] = $row->document_id;
            $arr['employee_name'] = $row->uploader_name ?: ($arr['employee_name'] ?? 'Unknown');
            $arr['file_path'] = $row->file_path ?: ($arr['file_path'] ?? '');
            $arr['display_name'] = $row->display_name;
            $arr['office_name'] = $row->office_name;
            $arr['shared_id'] = $row->id;

            return $arr;
        })->filter()->values());
    }

    public function uploadAttachments(Request $request)
    {
        try {
            $userId = $request->input('user_id');
            $user = User::where('user_id', $userId)->firstOrFail();
            
            // Allow both 'files' and 'files[]' naming conventions
            if (!$request->hasFile('files') && (!$request->hasFile('files[]'))) {
                return response()->json(['error' => 'No files uploaded'], 400);
            }

            $rawFiles = $request->file('files') ?? $request->file('files[]');
            
            // Ensure $files is ALWAYS an array, even if a single file is uploaded
            $files = is_array($rawFiles) ? $rawFiles : [$rawFiles];

            $tempDirName = 'temp_attachments_' . uniqid();
            $filePaths = [];

            foreach ($files as $file) {
                if ($file && $file->isValid()) {
                    // Only process files that are not empty
                    if ($file->getSize() > 0) {
                        $path = $file->storeAs($tempDirName, $file->getClientOriginalName(), 'local');
                        $filePaths[] = Storage::disk('local')->path($path);
                    }
                }
            }

            if (empty($filePaths)) {
                 return response()->json(['error' => 'No valid files were uploaded. Make sure files are not empty.'], 400);
            }

            $outputFilename = uniqid() . '_' . ($user->last_name ?: 'Attachments') . '.pdf';
            $publicPath = 'documents/' . $outputFilename;
            $absoluteOutputPath = Storage::disk('public')->path($publicPath);

            $dir = dirname($absoluteOutputPath);
            if (!file_exists($dir)) mkdir($dir, 0755, true);

            $this->runPythonScript('merge_pdfs', [
                'input_files' => $filePaths,
                'output_path' => $absoluteOutputPath
            ]);

            Storage::disk('local')->deleteDirectory($tempDirName);
            
            // Auto-create document to bypass static CORS block on frontend
            $doc = Document::create([
                'employee_id' => $user->id,
                'file_path' => $publicPath,
                'status' => 'draft',
                'is_draft' => true
            ]);

            LogHelper::log($user->id, 'CREATE', 'Document', "Merged attachments into a new PDF document: '{$outputFilename}'", $doc->id);

            return response()->json([
                'message' => 'Converted', 
                'file_path' => $publicPath,
                'document' => $doc->toArray()
            ], 200);

        } catch (\Exception $e) {
            // Clean up temp directory on failure
            if (isset($tempDirName) && Storage::disk('local')->exists($tempDirName)) {
                Storage::disk('local')->deleteDirectory($tempDirName);
            }
            return response()->json(['error' => 'Conversion failed: ' . $e->getMessage()], 500);
        }
    }
}

