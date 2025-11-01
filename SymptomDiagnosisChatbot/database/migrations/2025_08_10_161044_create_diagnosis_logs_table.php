<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('diagnosis_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('diagnosis_id')->constrained('diagnosis')->cascadeOnDelete();
            $table->integer('step');
            $table->enum('sender', ['system', 'user']);
            $table->string('action', 255);
            $table->text('message');
            $table->timestamp('created_at')->nullable();
            $table->boolean('is_final_step')->default(false);
            $table->boolean('user_feedback')->default(false);
        });
    }

    public function down(): void {
        Schema::dropIfExists('diagnosis_logs');
    }
};
