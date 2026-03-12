<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    /**
     * Send a new message
     */
    public function sendMessage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'sender_user_id' => 'required|string',
            'recipient_user_id' => 'required|string',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        $sender = User::where('user_id', $request->input('sender_user_id'))->first();
        if (!$sender) {
            return response()->json(['error' => 'Sender not found'], 404);
        }

        $recipient = User::where('user_id', $request->input('recipient_user_id'))->first();
        if (!$recipient) {
            return response()->json(['error' => 'Recipient not found'], 404);
        }

        // Prevent sending message to self
        if ($sender->id === $recipient->id) {
            return response()->json(['error' => 'You cannot send a message to yourself'], 400);
        }

        $message = Message::create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'subject' => $request->input('subject'),
            'message' => $request->input('message'),
            'is_read' => false,
        ]);

        return response()->json([
            'message' => 'Message sent successfully',
            'data' => $message->toArray()
        ], 201);
    }

    /**
     * Get received messages for a user
     */
    public function getMessages($user_id)
    {
        $user = User::where('user_id', $user_id)->firstOrFail();
        
        $messages = Message::where('recipient_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($msg) {
                return [
                    'id' => $msg->id,
                    'sender_id' => $msg->sender_id,
                    'sender_user_id' => $msg->sender ? $msg->sender->user_id : null,
                    'sender_name' => $msg->sender ? $msg->sender->full_name : 'Unknown',
                    'sender_role' => $msg->sender ? $msg->sender->role : null,
                    'subject' => $msg->subject,
                    'message' => $msg->message,
                    'is_read' => $msg->is_read,
                    'read_at' => $msg->read_at ? $msg->read_at->toISOString() : null,
                    'created_at' => $msg->created_at ? $msg->created_at->toISOString() : null,
                ];
            });

        $unreadCount = Message::where('recipient_id', $user->id)->where('is_read', false)->count();

        return response()->json([
            'messages' => $messages,
            'unread_count' => $unreadCount
        ], 200);
    }

    /**
     * Get sent messages for a user
     */
    public function getSentMessages($user_id)
    {
        $user = User::where('user_id', $user_id)->firstOrFail();
        
        $messages = Message::where('sender_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($msg) {
                return [
                    'id' => $msg->id,
                    'recipient_id' => $msg->recipient_id,
                    'recipient_user_id' => $msg->recipient ? $msg->recipient->user_id : null,
                    'recipient_name' => $msg->recipient ? $msg->recipient->full_name : 'Unknown',
                    'recipient_role' => $msg->recipient ? $msg->recipient->role : null,
                    'subject' => $msg->subject,
                    'message' => $msg->message,
                    'is_read' => $msg->is_read,
                    'read_at' => $msg->read_at ? $msg->read_at->toISOString() : null,
                    'created_at' => $msg->created_at ? $msg->created_at->toISOString() : null,
                ];
            });

        return response()->json([
            'messages' => $messages
        ], 200);
    }

    /**
     * Mark a message as read
     */
    public function markAsRead($message_id)
    {
        $message = Message::findOrFail($message_id);
        $message->markAsRead();
        
        return response()->json(['message' => 'Message marked as read']);
    }

    /**
     * Mark all messages as read for a user
     */
    public function markAllAsRead($user_id)
    {
        $user = User::where('user_id', $user_id)->firstOrFail();
        
        Message::where('recipient_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'All messages marked as read']);
    }

    /**
     * Delete a message
     */
    public function deleteMessage($message_id)
    {
        $message = Message::findOrFail($message_id);
        $message->delete();
        
        return response()->json(['message' => 'Message deleted']);
    }

    /**
     * Get unread message count for a user
     */
    public function getUnreadCount($user_id)
    {
        $user = User::where('user_id', $user_id)->firstOrFail();
        
        $unreadCount = Message::where('recipient_id', $user->id)->where('is_read', false)->count();

        return response()->json([
            'unread_count' => $unreadCount
        ], 200);
    }

    /**
     * Get all users for composing messages
     */
    public function getUsers($user_id)
    {
        $currentUser = User::where('user_id', $user_id)->firstOrFail();
        
        // Get all active users except current user
        $users = User::where('is_active', true)
            ->where('id', '!=', $currentUser->id)
            ->get()
            ->map(function ($u) {
                return [
                    'user_id' => $u->user_id,
                    'full_name' => $u->full_name,
                    'role' => $u->role,
                    'office_name' => $u->officeLocation ? $u->officeLocation->location : null,
                ];
            });

        return response()->json([
            'users' => $users
        ], 200);
    }
}