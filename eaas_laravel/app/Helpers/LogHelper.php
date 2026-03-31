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
            $actorName = 'System / Unknown';

            if ($actorIdentifier) {
                if (is_numeric($actorIdentifier)) {
                    $user = User::find((int) $actorIdentifier);
                } else {
                    $user = User::where('user_id', $actorIdentifier)->orWhere('public_id', $actorIdentifier)->first();
                }

                if ($user) {
                    $userId = $user->id;
                    $actorName = $user->full_name; 
                }
            }

            $formattedDetails = "{$actorName} - {$details}";

            ActivityLog::create([
                'user_id' => $userId,
                'action' => strtoupper($action),
                'entity_type' => $entityType,
                'entity_id' => $entityId ? (string) $entityId : null,
                'details' => $formattedDetails // Save the new string to the DB
            ]);
        } catch (\Exception $e) {

            error_log("Failed to write to activity log: " . $e->getMessage());
        }
    }
}