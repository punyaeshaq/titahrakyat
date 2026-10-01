<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\SiteSetting;
use App\Models\User;
use App\Models\Ad;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin',
            'email' => 'admin@TitahRakyat.Com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        // Create default categories
        $categories = [
            ['label' => 'Politik', 'color' => '#EF4444'],
            ['label' => 'Ekonomi', 'color' => '#F59E0B'],
            ['label' => 'Teknologi', 'color' => '#3B82F6'],
            ['label' => 'Olahraga', 'color' => '#10B981'],
            ['label' => 'Hiburan', 'color' => '#8B5CF6'],
            ['label' => 'Kesehatan', 'color' => '#EC4899'],
            ['label' => 'Pendidikan', 'color' => '#06B6D4'],
            ['label' => 'Gaya Hidup', 'color' => '#F97316'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }

        // Create default site settings
        $settings = [
            ['key' => 'site_name', 'value' => 'TitahRakyat.Com'],
            ['key' => 'site_description', 'value' => 'Portal Berita Terpercaya'],
            ['key' => 'contact_email', 'value' => 'redaksi@TitahRakyat.Com'],
            ['key' => 'about_text', 'value' => 'TitahRakyat.Com adalah portal berita yang menyajikan informasi terkini dan terpercaya.'],
        ];

        foreach ($settings as $setting) {
            SiteSetting::create($setting);
        }

        // Create sample ads
        Ad::create([
            'title' => 'Contoh Iklan Header',
            'image_url' => 'https://placehold.co/970x90/333/FFF?text=Space+Iklan+Header',
            'target_url' => 'https://TitahRakyat.Com',
            'position' => 'header',
            'is_active' => true,
        ]);

        Ad::create([
            'title' => 'Contoh Iklan Sidebar',
            'image_url' => 'https://placehold.co/300x250/333/FFF?text=Space+Iklan+Sidebar',
            'target_url' => 'https://TitahRakyat.Com',
            'position' => 'sidebar',
            'is_active' => true,
        ]);

        // Seed Polls
        $this->call(PollSeeder::class);
    }
}
