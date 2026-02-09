<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EditorialStaff;
use Illuminate\Http\Request;

class EditorialStaffController extends Controller
{
    public function index()
    {
        $staff = EditorialStaff::orderBy('sort_order')->get();
        return response()->json($staff);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'photo_url' => 'nullable|string',
            'sort_order' => 'nullable|integer',
        ]);

        $staff = EditorialStaff::create($validated);
        return response()->json($staff, 201);
    }

    public function update(Request $request, $id)
    {
        $staff = EditorialStaff::findOrFail($id);
        $staff->update($request->only(['name', 'position', 'photo_url', 'sort_order']));
        return response()->json($staff);
    }

    public function destroy($id)
    {
        $staff = EditorialStaff::findOrFail($id);
        $staff->delete();
        return response()->json(['message' => 'Staff deleted']);
    }
}
