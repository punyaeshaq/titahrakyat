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
        $extension = $file->getClientOriginalExtension();
        $filename = Str::uuid() . '.' . $extension;
        $destinationPath = public_path('uploads');
        $fullPath = $destinationPath . '/' . $filename;

        if (!file_exists($destinationPath)) {
            mkdir($destinationPath, 0755, true);
        }

        // Try to optimize if GD is available and it's a supported type
        $optimized = false;
        if (extension_loaded('gd') && in_array(strtolower($extension), ['jpg', 'jpeg', 'png', 'webp'])) {
            try {
                $this->optimizeImage($file->getPathname(), $fullPath, $extension);
                $optimized = true;
            } catch (\Exception $e) {
                // Fallback to normal move if optimization fails
                \Log::error("Image optimization failed: " . $e->getMessage());
            }
        }

        if (!$optimized) {
            $file->move($destinationPath, $filename);
        }

        $url = url('uploads/' . $filename);

        return response()->json([
            'url' => $url,
            'filename' => $filename,
        ]);
    }

    private function optimizeImage($source, $destination, $extension)
    {
        $info = getimagesize($source);
        if (!$info)
            throw new \Exception("Invalid image");

        $mime = $info['mime'];
        $image = null;

        switch ($mime) {
            case 'image/jpeg':
                $image = imagecreatefromjpeg($source);
                break;
            case 'image/png':
                $image = imagecreatefrompng($source);
                break;
            case 'image/webp':
                $image = imagecreatefromwebp($source);
                break;
        }

        if (!$image)
            throw new \Exception("Unsupported mime type");

        // Resize if width > 1200
        $width = imagesx($image);
        if ($width > 1200) {
            $image = imagescale($image, 1200);
        }

        // Save
        switch (strtolower($extension)) {
            case 'jpg':
            case 'jpeg':
                imagejpeg($image, $destination, 80);
                break;
            case 'png':
                imagealphablending($image, false);
                imagesavealpha($image, true);
                imagepng($image, $destination, 6);
                break;
            case 'webp':
                imagewebp($image, $destination, 80);
                break;
        }

        imagedestroy($image);
    }
}

