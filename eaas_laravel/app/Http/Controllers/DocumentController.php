<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Helpers\LogHelper;
use Symfony\Component\Process\Process;

class DocumentController extends Controller
{
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

        LogHelper::log($user->id, 'CREATE', 'Document', "User uploaded a draft document", $doc->id);
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

        LogHelper::log($user->id, 'UPDATE', 'Document', "User autosaved draft #{$doc->id}", $doc->id);
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

        LogHelper::log($user->id, 'SUBMIT', 'Document', "User submitted document #{$doc->id}", $doc->id);
        return response()->json(['message' => 'Document submitted', 'document' => $doc->toArray()]);
    }

    public function reviewDocument(Request $request, $doc_id)
    {
        $doc = Document::findOrFail($doc_id);
        $reviewerId = $request->input('reviewer_id') ?? $request->input('user_id');
        $reviewer = User::where('user_id', $reviewerId)->firstOrFail();

        if ($doc->reviewer_id !== $reviewer->id) return response()->json(['error' => 'Unauthorized'], 403);

        $action = $request->input('action') ?? $request->input('status');
        if (in_array($action, ['approve', 'approved'])) {
            $doc->status = 'approved';
            $doc->reviewed_at = now();
            $doc->save();
            return response()->json(['message' => 'Document approved', 'document' => $doc->toArray()]);
        } elseif (in_array($action, ['decline', 'declined'])) {
            $reason = $request->input('reason') ?? $request->input('note', '');
            $doc->status = 'declined';
            $doc->reviewer_note = $reason;
            $doc->reviewed_at = now();
            $doc->save();
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
        return Storage::disk('public')->download($path);
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
        if ($doc->file_path) Storage::disk('public')->delete($doc->file_path);
        if ($doc->review_file_path) Storage::disk('public')->delete($doc->review_file_path);
        $doc->delete();
        return response()->json(['message' => 'Document deleted']);
    }

    public function getUserDocuments($user_id)
    {
        $user = User::where('user_id', $user_id)->firstOrFail();
        $docs = Document::where('employee_id', $user->id)->orderBy('updated_at', 'desc')->get();
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
        return response()->json(['message' => 'Uploaded', 'document' => $doc->toArray()], 200);
    }

    public function getNotifications($user_id)
    {
        $user = User::where('user_id', $user_id)->firstOrFail();
        $declinedDocs = Document::where('employee_id', $user->id)
            ->where('status', 'declined')
            ->whereNotNull('reviewer_note')
            ->where('reviewer_note', '!=', '')
            ->orderBy('reviewed_at', 'desc')
            ->get();

        $notifications = [];
        foreach ($declinedDocs as $doc) {
            $notifications[] = [
                'id' => $doc->id,
                'document_id' => $doc->id,
                'document_name' => basename($doc->file_path),
                'title' => 'Document Declined',
                'message' => 'Your document was declined',
                'reviewer_note' => $doc->reviewer_note,
                'notification_type' => 'declined',
                'is_read' => false,
                'created_at' => $doc->reviewed_at ? $doc->reviewed_at->toISOString() : null,
            ];
        }
        return response()->json(['notifications' => $notifications, 'unread_count' => count($notifications)], 200);
    }

    public function markNotificationsRead(Request $request, $user_id)
    {
        return response()->json(['message' => 'Read']);
    }

    public function clearNotifications(Request $request, $user_id)
    {
        return response()->json(['message' => 'Cleared']);
    }

    public function renameDocument(Request $request, $doc_id)
    {
        $doc = Document::findOrFail($doc_id);
        $newFilename = $request->input('filename');
        if (!$newFilename) return response()->json(['error' => 'Required'], 400);
        if (!str_ends_with(strtolower($newFilename), '.pdf')) $newFilename .= '.pdf';

        if ($doc->file_path && Storage::disk('public')->exists($doc->file_path)) {
            $dir = dirname($doc->file_path);
            $newPath = $dir . '/' . uniqid() . '_' . $newFilename;
            Storage::disk('public')->move($doc->file_path, $newPath);
            $doc->file_path = $newPath;
            $doc->save();
        }
        return response()->json(['message' => 'Renamed', 'document' => $doc->toArray(), 'file_path' => ltrim($doc->file_path, '/')]);
    }

    public function uploadAttachments(Request $request)
    {
        try {
            $userId = $request->input('user_id');
            $user = User::where('user_id', $userId)->firstOrFail();
            
            // Allow both 'files' and 'files[]' naming conventions
            if (!$request->hasFile('files') && !$request->hasFile('files[]')) {
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

            LogHelper::log($user->id, 'CREATE', 'Document', "Merged attachments into document #{$doc->id}", $doc->id);

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