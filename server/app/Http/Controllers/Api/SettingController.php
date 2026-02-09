<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Models\EditorialStaff;
use App\Models\SocialLink;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        $settings = SiteSetting::all()->pluck('value', 'key');
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $settings = $request->input('settings', []);

        foreach ($settings as $key => $value) {
            SiteSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return response()->json(['message' => 'Settings updated']);
    }

    public function editorialStaff()
    {
        $staff = EditorialStaff::orderBy('sort_order')->get();
        return response()->json($staff);
    }

    public function socialLinks()
    {
        $links = SocialLink::active()->get();
        return response()->json($links);
    }
}

