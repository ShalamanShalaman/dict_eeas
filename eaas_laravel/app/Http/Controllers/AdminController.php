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
use App\Helpers\LogHelper;

class AdminController extends Controller
{
    /**
     * Create a notification for admin users
     */
    private function createAdminNotification($type, $title, $message, $data = null)
    {
        // Get all admin users
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
        $logs = ActivityLog::orderBy('created_at', 'desc')->get();
        return response()->json($logs->map->toArray());
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

        // Notify admins about new position
        $this->createAdminNotification(
            'position_created',
            'New Position Created',
            "A new position has been created: {$name}",
            ['position_id' => $pos->id, 'position_name' => $name]
        );

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

        // Notify admins about position deletion
        $this->createAdminNotification(
            'position_deleted',
            'Position Deleted',
            "Position '{$pos_name}' has been deleted from the system",
            ['deleted_position_name' => $pos_name]
        );

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

        $loc = OfficeLocation::create([
            'location' => $location,
            'reviewer_id' => $request->input('reviewer_id')
        ]);

        // Notify admins about new office location
        $this->createAdminNotification(
            'office_location_created',
            'New Office Location Created',
            "A new office location has been created: {$location}",
            ['location_id' => $loc->id, 'location_name' => $location]
        );

        LogHelper::log($request->input('action_by') ?? $request->input('admin_id'), 'CREATE', 'OfficeLocation', "Created office location: {$location}", $loc->id);

        return response()->json(['message' => 'Location created', 'location' => $loc->toArray()], 201);
    }

    public function editLocation(Request $request, $loc_id)
    {
        $loc = OfficeLocation::findOrFail($loc_id);
        $loc->update([
            'location' => $request->input('location', $loc->location),
            'reviewer_id' => $request->input('reviewer_id', $loc->reviewer_id)
        ]);

        LogHelper::log($request->input('action_by') ?? $request->input('admin_id'), 'UPDATE', 'OfficeLocation', "Updated office location: {$loc->location}", $loc->id);

        return response()->json(['message' => 'Location updated', 'location' => $loc->toArray()]);
    }

    public function deleteLocation(Request $request, $loc_id)
    {
        $loc = OfficeLocation::findOrFail($loc_id);
        $loc_name = $loc->location;
        $loc->delete();

        // Notify admins about office location deletion
        $this->createAdminNotification(
            'office_location_deleted',
            'Office Location Deleted',
            "Office location '{$loc_name}' has been deleted from the system",
            ['deleted_location_name' => $loc_name]
        );

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

        // Generate a random password for new users
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

        // Notify admins about new user registration
        $this->createAdminNotification(
            'user_registered',
            'New User Registered',
            "A new {$request->input('role')} has been registered: {$user->full_name} ({$user->user_id})",
            ['user_id' => $user->id, 'user_name' => $user->full_name, 'role' => $user->role]
        );

        LogHelper::log($request->input('action_by') ?? $request->input('admin_id'), 'CREATE', 'User', "Created user: {$user->user_id} ({$user->role})", $user->id);

        // =========================================================================
        // Print the generated credentials to the artisan serve terminal
        // =========================================================================
        error_log("\n=======================================================");
        error_log(" 🚀 NEW USER ACCOUNT CREATED! ");
        error_log("=======================================================");
        error_log(" Name     : " . $user->full_name);
        error_log(" Role     : " . ucfirst($user->role));
        error_log(" User ID  : " . $user->user_id);
        error_log(" Password : " . $tempPassword);
        error_log("=======================================================\n");

        return response()->json([
            'message' => 'User created', 
            'user' => $user->toArray(),
            'generated_password' => $tempPassword // Included in response just in case you need it on the frontend later
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

        // Allow Admin to reset the password during edit if they provide one
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

        // Notify admins about user role change
        if ($request->has('role') && $request->input('role') !== $user->role) {
            $this->createAdminNotification(
                'user_role_changed',
                'User Role Changed',
                "User {$user->full_name} ({$user->user_id}) role changed from {$user->role} to {$request->input('role')}",
                ['user_id' => $user->id, 'user_name' => $user->full_name, 'old_role' => $user->role, 'new_role' => $request->input('role')]
            );
        }

        // Notify admins about user profile update
        $this->createAdminNotification(
            'user_updated',
            'User Updated',
            "User {$user->full_name} ({$user->user_id}) has been updated by an administrator.",
            ['user_id' => $user->id, 'user_name' => $user->full_name]
        );

        LogHelper::log($request->input('action_by') ?? $request->input('admin_id'), 'UPDATE', 'User', "Updated user profile: {$user->user_id}", $user->id);

        return response()->json(['message' => 'User updated', 'user' => $user->toArray()]);
    }

    public function deleteUser(Request $request, $public_id)
    {
        $user = User::where('public_id', $public_id)->firstOrFail();
        $user_id_str = $user->user_id;
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

        // Notify admins about user deletion
        $this->createAdminNotification(
            'user_deleted',
            'User Deleted',
            "User {$user_id_str} has been deleted from the system",
            ['deleted_user_id' => $user_id_int, 'user_id' => $user_id_str]
        );

        LogHelper::log($request->query('action_by'), 'DELETE', 'User', "Deleted user: {$user_id_str}", $user_id_int);

        return response()->json(['message' => 'User deleted']);
    }
}