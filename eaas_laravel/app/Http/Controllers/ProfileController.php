<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use App\Helpers\LogHelper;

class ProfileController extends Controller
{
    /**
     * Create a notification for a user
     */
    private function createNotification($userId, $type, $title, $message, $data = null)
    {
        return Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'is_read' => false,
        ]);
    }

    /**
     * Create notifications for admin users
     */
    private function createAdminNotifications($type, $title, $message, $data = null)
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

    public function sendOtp(Request $request)
    {
        $userId = $request->input('user_id');
        $contactNo = $request->input('contact_no');

        if (!$userId || !$contactNo) {
            return response()->json(['error' => 'Missing user_id or contact_no'], 400);
        }

        $code = str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
        Cache::put("otp_{$userId}", $code, now()->addMinutes(10));

        return response()->json([
            'message' => 'OTP sent successfully',
            'debug_otp' => $code
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $userId = $request->input('user_id');
        $otp = $request->input('otp');

        if (!$userId || !$otp) {
            return response()->json(['error' => 'Missing data'], 400);
        }

        $storedOtp = Cache::get("otp_{$userId}");

        if ($storedOtp && $storedOtp === $otp) {
            Cache::forget("otp_{$userId}");
            return response()->json(['message' => 'Phone verified successfully']);
        }

        return response()->json(['error' => 'Invalid or expired OTP'], 400);
    }

    public function getProfile($public_id)
    {
        $user = User::where('public_id', $public_id)->firstOrFail();
        return response()->json($user->toArray());
    }

    public function editOwnProfile(Request $request, $public_id)
    {
        $user = User::where('public_id', $public_id)->firstOrFail();

        $user->first_name = $request->input('first_name', $user->first_name);
        $user->middle_name = $request->input('middle_name', $user->middle_name);
        $user->last_name = $request->input('last_name', $user->last_name);
        $user->contact_no = $request->input('contact_no', $user->contact_no);

        $newEmail = $request->input('email');
        if ($newEmail && $newEmail !== $user->email) {
            if (User::where('email', $newEmail)->exists()) {
                return response()->json(['error' => 'Email already in use'], 409);
            }
            $user->email = $newEmail;
        }

        $newPassword = $request->input('password');
        $passwordChanged = false;
        if ($newPassword) {
            $oldPassword = $request->input('old_password');
            $otp = $request->input('otp');

            if ($otp) {
                $storedOtp = Cache::get("otp_{$user->user_id}");
                if (!$storedOtp || $storedOtp !== $otp) {
                    return response()->json(['error' => 'Invalid or expired OTP'], 400);
                }
                $user->password = Hash::make($newPassword);
                $user->force_change_password = false;
                $passwordChanged = true;
                Cache::forget("otp_{$user->user_id}");
            } elseif ($oldPassword) {
                if (!Hash::check($oldPassword, $user->password)) {
                    return response()->json(['error' => 'Incorrect old password'], 401);
                }
                $user->password = Hash::make($newPassword);
                $user->force_change_password = false;
                $passwordChanged = true;
            } else {
                return response()->json(['error' => 'Old password or OTP verification is required to set a new password'], 400);
            }
        }

        $user->save();

        // Notify employee of profile update
        $this->createNotification(
            $user->id,
            'profile_updated',
            'Profile Updated',
            'Your profile information has been updated successfully.',
            ['updated_fields' => array_keys($request->only(['first_name', 'middle_name', 'last_name', 'contact_no', 'email']))]
        );

        // Notify employee if password was changed
        if ($passwordChanged) {
            $this->createNotification(
                $user->id,
                'password_changed',
                'Password Changed',
                'Your password has been changed successfully. If you did not make this change, please contact support immediately.',
                ['changed_at' => now()->toISOString()]
            );
        }

        // Notify admins about profile update
        $this->createAdminNotifications(
            'user_profile_updated',
            'User Profile Updated',
            "User {$user->full_name} ({$user->user_id}) updated their profile.",
            ['user_id' => $user->id, 'user_name' => $user->full_name]
        );

        LogHelper::log($user->id, 'UPDATE', 'User', "User {$user->user_id} updated their own profile", $user->id);

        return response()->json(['message' => 'Profile updated', 'user' => $user->toArray()]);
    }

    public function uploadProfilePicture(Request $request, $public_id)
    {
        $user = User::where('public_id', $public_id)->firstOrFail();

        if (!$request->hasFile('file')) {
            return response()->json(['error' => 'No file provided'], 400);
        }

        $file = $request->file('file');
        $allowedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];

        if (!in_array(strtolower($file->getClientOriginalExtension()), $allowedExtensions)) {
            return response()->json(['error' => 'Invalid file type. Only PNG, JPG, JPEG, GIF, and WEBP are allowed'], 400);
        }

        if ($user->profile_picture) {
            Storage::disk('public')->delete("profile_pictures/{$user->profile_picture}");
        }

        $filename = "{$public_id}." . $file->getClientOriginalExtension();
        $file->storeAs('profile_pictures', $filename, 'public');

        $user->profile_picture = $filename;
        $user->profile_picture_updated = now();
        $user->save();

        LogHelper::log($request->input('action_by') ?? $user->id, 'UPDATE', 'User', "Uploaded profile picture for {$user->user_id}", $user->id);

        return response()->json([
            'message' => 'Profile picture uploaded successfully',
            'profile_picture' => $filename,
            'user' => $user->toArray()
        ], 200);
    }

    public function getProfilePicture($public_id)
    {
        $user = User::where('public_id', $public_id)->firstOrFail();

        if (!$user->profile_picture || !Storage::disk('public')->exists("profile_pictures/{$user->profile_picture}")) {
            return response()->json(['error' => 'No profile picture found'], 404);
        }

        return response()->file(Storage::disk('public')->path("profile_pictures/{$user->profile_picture}"));
    }

    public function deleteProfilePicture(Request $request, $public_id)
    {
        $user = User::where('public_id', $public_id)->firstOrFail();

        if ($user->profile_picture) {
            Storage::disk('public')->delete("profile_pictures/{$user->profile_picture}");
            $user->profile_picture = null;
            $user->save();

            LogHelper::log($request->query('action_by') ?? $user->id, 'DELETE', 'User', "Deleted profile picture for {$user->user_id}", $user->id);

            return response()->json([
                'message' => 'Profile picture deleted successfully',
                'user' => $user->toArray()
            ], 200);
        }

        return response()->json(['error' => 'No profile picture to delete'], 404);
    }
}