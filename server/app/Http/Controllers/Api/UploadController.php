<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:30720', // 30MB max
        ]);

        $file = $request->file('file');
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();

        // Store in public/uploads directory
        $file->move(public_path('uploads'), $filename);

        $url = url('uploads/' . $filename);

        return response()->json([
            'url' => $url,
            'filename' => $filename,
        ]);
    }
}

