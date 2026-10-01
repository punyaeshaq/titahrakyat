<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('newsletter_subscribers')) {
            Schema::create('newsletter_subscribers', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('email')->unique();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('polls')) {
            Schema::create('polls', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('question');
                $table->boolean('is_active')->default(true);
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('poll_options')) {
            Schema::create('poll_options', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->foreignUuid('poll_id')->constrained()->cascadeOnDelete();
                $table->string('option_text');
                $table->integer('votes_count')->default(0);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('poll_votes')) {
            Schema::create('poll_votes', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->foreignUuid('poll_id')->constrained()->cascadeOnDelete();
                $table->foreignUuid('poll_option_id')->constrained()->cascadeOnDelete();
                $table->string('ip_address')->nullable();
                $table->string('user_agent')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('poll_votes');
        Schema::dropIfExists('poll_options');
        Schema::dropIfExists('polls');
        Schema::dropIfExists('newsletter_subscribers');
    }
};
