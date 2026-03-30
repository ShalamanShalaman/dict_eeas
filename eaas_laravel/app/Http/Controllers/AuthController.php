<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Helpers\LogHelper;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $userId = $request->input('user_id');
        $password = $request->input('password');

        if (!$userId || !$password) {
            return response()->json(['error' => 'User ID and password required'], 400);
        }

        $user = User::where('user_id', $userId)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        $user->update(['last_login' => now()]);

        LogHelper::log($user->id, 'LOGIN', 'Authentication', "User {$user->user_id} logged in", $user->id);

        return response()->json([
            'message' => 'Login successful',
            'user' => $user->toArray()
        ], 200);
    }

    public function logout(Request $request)
    {
        $identifier = $request->input('user_id');

        if ($identifier) {
            $user = User::where('user_id', $identifier)
                        ->orWhere('id', $identifier)
                        ->first();

            if ($user) {
                LogHelper::log($user->id, 'LOGOUT', 'Authentication', "User {$user->user_id} logged out", $user->id);
            }
        }

        return response()->json(['message' => 'Logged out successfully'], 200);
    }
}