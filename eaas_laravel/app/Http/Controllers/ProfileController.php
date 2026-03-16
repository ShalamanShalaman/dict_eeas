<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Helpers\LogHelper;

class ProfileController extends Controller
{

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

    public function sendOtp(Request $request)
    {
        $userId = $request->input('user_id');

        $newEmail = $request->input('email'); 

        if (!$userId) {
            return response()->json(['error' => 'Missing user_id'], 400);
        }

        $user = User::where('user_id', $userId)->first();
        if (!$user && !$newEmail) {
            return response()->json(['error' => 'User not found and no email provided'], 404);
        }

        $targetEmail = $newEmail ?? $user->email;

        if (!$targetEmail) {
            return response()->json(['error' => 'No email address available to send OTP'], 400);
        }

        $code = str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);

        Cache::put("otp_{$userId}", $code, now()->addMinutes(10));

        try {
            $emailContent = "
            <div style=\"font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);\">
                <div style=\"text-align: center; margin-bottom: 25px;\">
                    <h2 style=\"color: #4f46e5; margin: 0; font-size: 24px;\">DICT-EAAS Verification</h2>
                </div>
                
                <p style=\"font-size: 16px;\">Hello,</p>
                
                <p style=\"font-size: 16px;\">You have requested an email verification code for your DICT-EAAS account.</p>
                
                <div style=\"background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;\">
                    <p style=\"margin: 0 0 10px 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;\">Your Verification Code</p>
                    <span style=\"font-family: monospace; background: #e2e8f0; padding: 10px 20px; border-radius: 6px; color: #1e293b; font-size: 32px; font-weight: bold; letter-spacing: 4px;\">{$code}</span>
                </div>
                
                <p style=\"color: #b91c1c; font-size: 14px;\">
                    <strong>Note:</strong> This code will expire in 10 minutes. If you did not request this, please ignore this email.
                </p>
            </div>
            ";
                          
            Mail::html($emailContent, function ($message) use ($targetEmail) {
                $message->to($targetEmail)
                        ->subject('Your DICT-EAAS Verification Code');
            });
        } catch (\Exception $e) {
            Log::error("Failed to send OTP Email: " . $e->getMessage());

            return response()->json([
                'error' => 'Mail Error: ' . $e->getMessage()
            ], 500);
        }

        return response()->json([
            'message' => 'OTP sent successfully to email'
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
            return response()->json(['message' => 'OTP verified successfully']);
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

        $otp = $request->input('otp');
        $otpVerified = false;

        if ($otp) {
            $storedOtp = Cache::get("otp_{$user->user_id}");
            if (!$storedOtp || $storedOtp !== $otp) {
                return response()->json(['error' => 'Invalid or expired OTP'], 400);
            }
            Cache::forget("otp_{$user->user_id}");
            $otpVerified = true;
        }

        $newEmail = $request->input('email');
        if ($newEmail && $newEmail !== $user->email) {
            if (!$otpVerified) {
                return response()->json(['error' => 'Email OTP verification is required to change your email address'], 403);
            }
            if (User::where('email', $newEmail)->exists()) {
                return response()->json(['error' => 'Email already in use'], 409);
            }
            $user->email = $newEmail;
        }

        $newPassword = $request->input('password');
        $passwordChanged = false;
        
        if ($newPassword) {
            $oldPassword = $request->input('old_password');

            if ($otpVerified) {
                $user->password = Hash::make($newPassword);
                $user->force_change_password = false;
                $passwordChanged = true;
            } elseif ($oldPassword) {
                if (!Hash::check($oldPassword, $user->password)) {
                    return response()->json(['error' => 'Incorrect old password'], 401);
                }
                $user->password = Hash::make($newPassword);
                $user->force_change_password = false;
                $passwordChanged = true;
            } else {
                return response()->json(['error' => 'Old password or Email OTP verification is required to set a new password'], 400);
            }
        }

        $user->save();

        $this->createNotification(
            $user->id,
            'profile_updated',
            'Profile Updated',
            'Your profile information has been updated successfully.',
            ['updated_fields' => array_keys($request->only(['first_name', 'middle_name', 'last_name', 'contact_no', 'email']))]
        );

        if ($passwordChanged) {
            $this->createNotification(
                $user->id,
                'password_changed',
                'Password Changed',
                'Your password has been changed successfully. If you did not make this change, please contact support immediately.',
                ['changed_at' => now()->toISOString()]
            );
        }

        LogHelper::log($user->id, 'UPDATE', 'User', "User {$user->user_id} updated their own profile", $user->id);

        return response()->json(['message' => 'Profile updated successfully', 'user' => $user->toArray()]);
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