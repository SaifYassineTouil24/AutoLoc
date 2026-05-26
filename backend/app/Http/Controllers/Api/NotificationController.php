<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(): JsonResponse
    {
        $notifs = AppNotification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        return response()->json([
            'notifications' => $notifs,
            'non_lues'      => $notifs->where('lu', false)->count(),
        ]);
    }

    public function marquerLu(AppNotification $notification): JsonResponse
    {
        abort_if($notification->user_id !== auth()->id(), 403);
        $notification->update(['lu' => true]);
        return response()->json(['ok' => true]);
    }

    public function marquerToutLu(): JsonResponse
    {
        AppNotification::where('user_id', auth()->id())
            ->where('lu', false)
            ->update(['lu' => true]);

        return response()->json(['ok' => true]);
    }

    public function destroy(AppNotification $notification): JsonResponse
    {
        abort_if($notification->user_id !== auth()->id(), 403);
        $notification->delete();
        return response()->json(['ok' => true]);
    }
}
