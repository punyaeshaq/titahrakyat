<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->input('limit', 50);
        $logs = ActivityLog::orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
        return response()->json($logs);
    }
}
