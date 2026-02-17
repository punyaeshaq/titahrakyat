<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Change position column to positions (TEXT to hold JSON array)
        Schema::table('ads', function (Blueprint $table) {
            $table->text('positions')->nullable()->after('target_url');
        });

        // Migrate existing data: convert single position to JSON array
        $ads = DB::table('ads')->get();
        foreach ($ads as $ad) {
            $positions = $ad->position ? json_encode([$ad->position]) : json_encode(['sidebar']);
            DB::table('ads')->where('id', $ad->id)->update(['positions' => $positions]);
        }

        // Drop old position column
        Schema::table('ads', function (Blueprint $table) {
            $table->dropColumn('position');
        });
    }

    public function down(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->string('position')->default('sidebar')->after('target_url');
        });

        // Migrate back: take first position from JSON array
        $ads = DB::table('ads')->get();
        foreach ($ads as $ad) {
            $positions = json_decode($ad->positions, true) ?: ['sidebar'];
            DB::table('ads')->where('id', $ad->id)->update(['position' => $positions[0]]);
        }

        Schema::table('ads', function (Blueprint $table) {
            $table->dropColumn('positions');
        });
    }
};
