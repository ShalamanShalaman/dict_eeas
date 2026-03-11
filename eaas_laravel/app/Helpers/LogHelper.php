<?php

namespace App\Helpers;

use App\Models\ActivityLog;
use App\Models\User;

class LogHelper
{
    public static function log($actorIdentifier, $action, $entityType, $details, $entityId = null)
    {
        try {
            $userId = null;
            if ($actorIdentifier) {
                if (is_numeric($actorIdentifier)) {
                    $user = User::find((int) $actorIdentifier);
                    if ($user) $userId = $user->id;
                } else {
                    $user = User::where('user_id', $actorIdentifier)->orWhere('public_id', $actorIdentifier)->first();
                    if ($user) $userId = $user->id;
                }
            }

            ActivityLog::create([
                'user_id' => $userId,
                'action' => strtoupper($action),
                'entity_type' => $entityType,
                'entity_id' => $entityId ? (string) $entityId : null,
                'details' => $details
            ]);
        } catch (\Exception $e) {
        }
    }
}