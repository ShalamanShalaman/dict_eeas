<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Position;
use App\Models\OfficeLocation;
use App\Models\User;
use App\Models\Document;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use App\Helpers\LogHelper;

class AdminController extends Controller
{

    private function createAdminNotification($type, $title, $message, $data = null)
    {
        $admins = User::where('role', 'admin')->where('is_active', true)->get();
        
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'data' => $data,
                'is_read' => false,
            ]);
        }
    }

    public function getActivityLogs()
    {
        $logs = ActivityLog::with('user')->orderBy('created_at', 'desc')->get();
        
        $mappedLogs = $logs->map(function ($log) {
            $array = $log->toArray();
            $array['user_name'] = $log->user ? $log->user->full_name : 'System';
            $array['user_role'] = $log->user ? $log->user->role : 'system';
            return $array;
        });

        return response()->json($mappedLogs);
    }

    public function getPositions()
    {
        $positions = Position::orderBy('created_at', 'desc')->get();
        return response()->json($positions->map->toArray());
    }

    public function createPosition(Request $request)
    {
        $name = $request->input('name');
        if (!$name) {
            return response()->json(['error' => 'Position name required'], 400);
        }
        if (Position::where('name', $name)->exists()) {
            return response()->json(['error' => 'Position already exists'], 409);
        }

        $pos = Position::create([
            'name' => $name,
            'description' => $request->input('description')
        ]);

        LogHelper::log($request->input('action_by') ?? $request->input('admin_id'), 'CREATE', 'Position', "Created position: {$name}", $pos->id);

        return response()->json(['message' => 'Position created', 'position' => $pos->toArray()], 201);
    }

    public function editPosition(Request $request, $pos_id)
    {
        $pos = Position::findOrFail($pos_id);
        $pos->update([
            'name' => $request->input('name', $pos->name),
            'description' => $request->input('description', $pos->description)
        ]);

        LogHelper::log($request->input('action_by') ?? $request->input('admin_id'), 'UPDATE', 'Position', "Updated position: {$pos->name}", $pos->id);

        return response()->json(['message' => 'Position updated', 'position' => $pos->toArray()]);
    }

    public function deletePosition(Request $request, $pos_id)
    {
        $pos = Position::findOrFail($pos_id);
        $pos_name = $pos->name;
        $pos->delete();

        LogHelper::log($request->query('action_by'), 'DELETE', 'Position', "Deleted position: {$pos_name}", $pos_id);

        return response()->json(['message' => 'Position deleted']);
    }

    public function getLocations()
    {
        $locations = OfficeLocation::orderBy('created_at', 'desc')->get();
        return response()->json($locations->map->toArray());
    }

    public function createLocation(Request $request)
    {
        $location = $request->input('location');
        if (!$location) {
            return response()->json(['error' => 'Location is required'], 400);
        }

        $data = [
            'location' => $location,
            'reviewer_id' => $request->input('reviewer_id'),
            'am_in' => $request->input('am_in'),
            'am_out' => $request->input('am_out'),
            'pm_in' => $request->input('pm_in'),
            'pm_out' => $request->input('pm_out'),
        ];

        $loc = OfficeLocation::create($data);

        if ($request->input('apply_to_all')) {
            OfficeLocation::query()->update([
                'am_in' => $request->input('am_in'),
                'am_out' => $request->input('am_out'),
                'pm_in' => $request->input('pm_in'),
                'pm_out' => $request->input('pm_out'),
            ]);
        }

        LogHelper::log($request->input('action_by') ?? $request->input('admin_id'), 'CREATE', 'OfficeLocation', "Created office location: {$location}", $loc->id);

        return response()->json(['message' => 'Location created', 'location' => $loc->toArray()], 201);
    }

    public function editLocation(Request $request, $loc_id)
    {
        $loc = OfficeLocation::findOrFail($loc_id);
        $loc->update([
            'location' => $request->input('location', $loc->location),
            'reviewer_id' => $request->input('reviewer_id', $loc->reviewer_id),
            'am_in' => $request->input('am_in', $loc->am_in),
            'am_out' => $request->input('am_out', $loc->am_out),
            'pm_in' => $request->input('pm_in', $loc->pm_in),
            'pm_out' => $request->input('pm_out', $loc->pm_out),
        ]);

        if ($request->input('apply_to_all')) {
            OfficeLocation::query()->update([
                'am_in' => $request->input('am_in', $loc->am_in),
                'am_out' => $request->input('am_out', $loc->am_out),
                'pm_in' => $request->input('pm_in', $loc->pm_in),
                'pm_out' => $request->input('pm_out', $loc->pm_out),
            ]);
        }

        LogHelper::log($request->input('action_by') ?? $request->input('admin_id'), 'UPDATE', 'OfficeLocation', "Updated office location: {$loc->location}", $loc->id);

        return response()->json(['message' => 'Location updated', 'location' => $loc->toArray()]);
    }

    public function deleteLocation(Request $request, $loc_id)
    {
        $loc = OfficeLocation::findOrFail($loc_id);
        $loc_name = $loc->location;
        $loc->delete();

        LogHelper::log($request->query('action_by'), 'DELETE', 'OfficeLocation', "Deleted office location: {$loc_name}", $loc_id);

        return response()->json(['message' => 'Location deleted']);
    }

    public function getUsers()
    {
        $users = User::orderBy('created_at', 'desc')->get();
        return response()->json($users->map->toArray());
    }

    public function createUser(Request $request)
    {
        $required = ['user_id', 'email', 'first_name', 'last_name', 'role'];
        foreach ($required as $req) {
            if (!$request->input($req)) {
                return response()->json(['error' => 'Missing required fields'], 400);
            }
        }

        if (User::where('user_id', $request->input('user_id'))->exists()) {
            return response()->json(['error' => 'User ID already exists'], 409);
            }
        if (User::where('email', $request->input('email'))->exists()) {
            return response()->json(['error' => 'Email already exists'], 409);
        }

        $tempPassword = Str::random(12);

        $pos_id = null;
        $pos_raw = $request->input('position_id');
        if ($pos_raw) {
            if (is_numeric($pos_raw)) {
                $pos_id = (int) $pos_raw;
            } else {
                $pos = Position::firstOrCreate(['name' => (string) $pos_raw]);
                $pos_id = $pos->id;
            }
        }

        $off_id = null;
        $off_raw = $request->input('office_location_id');
        if ($off_raw) {
            if (is_numeric($off_raw)) {
                $off_id = (int) $off_raw;
            } else {
                $loc = OfficeLocation::firstOrCreate(['location' => (string) $off_raw]);
                $off_id = $loc->id;
            }
        }

        $user = User::create([
            'user_id' => $request->input('user_id'),
            'email' => $request->input('email'),
            'password' => Hash::make($tempPassword),
            'first_name' => $request->input('first_name'),
            'middle_name' => $request->input('middle_name'),
            'last_name' => $request->input('last_name'),
            'contact_no' => $request->input('contact_no'),
            'role' => $request->input('role'),
            'office_location_id' => $off_id,
            'position_id' => $pos_id,
            'force_change_password' => true
        ]);

        $emailSent = false;
        try {
            $emailContent = "
            <div style=\"font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);\">
                <div style=\"text-align: center; margin-bottom: 25px;\">
                    <h2 style=\"color: #4f46e5; margin: 0; font-size: 24px;\">Welcome to DICT-EAAS!</h2>
                </div>
                
                <p style=\"font-size: 16px;\">Greetings <strong>{$user->first_name}</strong>,</p>
                
                <p style=\"font-size: 16px;\">Your new account has been successfully created for the <strong>Employee Attendance and Accomplishment System (DICT-EAAS)</strong>.</p>
                
                <p style=\"font-size: 16px;\">Below are your official temporary login credentials:</p>
                
                <div style=\"background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 20px; border-radius: 8px; margin: 25px 0;\">
                    <p style=\"margin: 0 0 15px 0; font-size: 16px;\">
                        <strong style=\"display: inline-block; width: 90px;\">User ID:</strong> 
                        <span style=\"font-family: monospace; background: #e2e8f0; padding: 6px 10px; border-radius: 6px; color: #1e293b; font-size: 18px; font-weight: bold;\">{$user->user_id}</span>
                    </p>
                    <p style=\"margin: 0; font-size: 16px;\">
                        <strong style=\"display: inline-block; width: 90px;\">Password:</strong> 
                        <span style=\"font-family: monospace; background: #e2e8f0; padding: 6px 10px; border-radius: 6px; color: #1e293b; font-size: 18px; font-weight: bold;\">{$tempPassword}</span>
                    </p>
                </div>
                
                <p style=\"color: #b91c1c; font-size: 14px; background-color: #fef2f2; padding: 12px; border-left: 4px solid #ef4444; border-radius: 4px;\">
                    <strong>Important:</strong> Please log in and change your password immediately upon your first login for your own security.
                </p>
                
                <p style=\"margin-top: 35px; font-size: 14px; color: #64748b; border-top: 1px solid #e5e7eb; padding-top: 20px;\">
                    Best regards,<br>
                    <strong>DICT-EAAS Admin Team</strong>
                </p>
            </div>
            ";

            Mail::html($emailContent, function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('Welcome to DICT-EAAS - Your Account Credentials');
            });
            $emailSent = true;
        } catch (\Exception $e) {
            error_log("Failed to send welcome email to {$user->email}: " . $e->getMessage());
        }

        $this->createAdminNotification(
            'user_registered',
            'New User Registered',
            "A new {$request->input('role')} has been registered: {$user->full_name} ({$user->user_id})",
            ['user_id' => $user->id, 'user_name' => $user->full_name, 'role' => $user->role]
        );

        LogHelper::log($request->input('action_by') ?? $request->input('admin_id'), 'CREATE', 'User', "Created user: {$user->full_name} ({$user->user_id})", $user->id);

        error_log("\n=======================================================");
        error_log(" 🚀 NEW USER ACCOUNT CREATED! ");
        error_log("=======================================================");
        error_log(" Name     : " . $user->full_name);
        error_log(" Role     : " . ucfirst($user->role));
        error_log(" User ID  : " . $user->user_id);
        error_log(" Password : " . $tempPassword);
        error_log(" Email Sent: " . ($emailSent ? 'Yes' : 'No'));
        error_log("=======================================================\n");

        return response()->json([
            'message' => 'User created successfully', 
            'user' => $user->toArray(),
            'generated_password' => $tempPassword,
            'email_sent' => $emailSent
        ], 201);
    }

    public function editUser(Request $request, $public_id)
    {
        $user = User::where('public_id', $public_id)->firstOrFail();

        $updateData = [
            'user_id' => $request->input('user_id', $user->user_id),
            'first_name' => $request->input('first_name', $user->first_name),
            'middle_name' => $request->input('middle_name', $user->middle_name),
            'last_name' => $request->input('last_name', $user->last_name),
            'email' => $request->input('email', $user->email),
            'role' => $request->input('role', $user->role),
            'contact_no' => $request->input('contact_no', $user->contact_no),
        ];

        if ($request->has('office_location_id')) {
            $off_raw = $request->input('office_location_id');
            if ($off_raw) {
                if (is_numeric($off_raw)) {
                    $updateData['office_location_id'] = (int) $off_raw;
                } else {
                    $loc = OfficeLocation::firstOrCreate(['location' => (string) $off_raw]);
                    $updateData['office_location_id'] = $loc->id;
                }
            } else {
                $updateData['office_location_id'] = null;
            }
        }

        if ($request->has('position_id')) {
            $pos_raw = $request->input('position_id');
            if ($pos_raw) {
                if (is_numeric($pos_raw)) {
                    $updateData['position_id'] = (int) $pos_raw;
                } else {
                    $pos = Position::firstOrCreate(['name' => (string) $pos_raw]);
                    $updateData['position_id'] = $pos->id;
                }
            } else {
                $updateData['position_id'] = null;
            }
        }

        if ($request->filled('password')) {
            $newPassword = $request->input('password');
            $updateData['password'] = Hash::make($newPassword);
            
            error_log("\n=======================================================");
            error_log(" 🔑 ADMIN UPDATED USER PASSWORD ");
            error_log(" User ID  : " . $updateData['user_id']);
            error_log(" New Pass : " . $newPassword);
            error_log("=======================================================\n");
        }

        $user->update($updateData);

        LogHelper::log($request->input('action_by') ?? $request->input('admin_id'), 'UPDATE', 'User', "Updated user profile: {$user->full_name} ({$user->user_id})", $user->id);

        return response()->json(['message' => 'User updated', 'user' => $user->toArray()]);
    }

    public function deleteUser(Request $request, $public_id)
    {
        $user = User::where('public_id', $public_id)->firstOrFail();
        $user_id_str = $user->user_id;
        $user_name = $user->full_name; 
        $user_id_int = $user->id;

        if ($user->profile_picture) {
            Storage::disk('public')->delete("profile_pictures/{$user->profile_picture}");
        }

        foreach ($user->submittedDocuments as $doc) {
            if ($doc->file_path) {
                Storage::disk('public')->delete($doc->file_path);
            }
            if ($doc->review_file_path) {
                Storage::disk('public')->delete($doc->review_file_path);
            }
        }

        $user->delete();

        LogHelper::log($request->query('action_by'), 'DELETE', 'User', "Deleted user: {$user_name} ({$user_id_str})", $user_id_int);

        return response()->json(['message' => 'User deleted']);
    }
}