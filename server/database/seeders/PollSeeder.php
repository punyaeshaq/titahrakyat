<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Poll;
use App\Models\PollOption;

class PollSeeder extends Seeder
{
    public function run()
    {
        // Check if active poll exists
        if (Poll::where('is_active', true)->exists()) {
            return;
        }

        $poll = Poll::create([
            'question' => 'Bagaimana pendapat Anda tentang tampilan baru TitahRakyat?',
            'is_active' => true,
            'expires_at' => now()->addDays(30),
        ]);

        PollOption::create(['poll_id' => $poll->id, 'option_text' => 'Sangat Bagus']);
        PollOption::create(['poll_id' => $poll->id, 'option_text' => 'Cukup Bagus']);
        PollOption::create(['poll_id' => $poll->id, 'option_text' => 'Biasa Saja']);
        PollOption::create(['poll_id' => $poll->id, 'option_text' => 'Kurang Menarik']);
    }
}
