<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('diagnosis_priorillnesses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('diagnosis_id')
                  ->constrained('diagnosis')
                  ->cascadeOnDelete();
            $table->foreignId('priorillness_id')
                  ->constrained('priorillnesses')
                  ->cascadeOnDelete();
            $table->timestamps();

            // Prevent duplicates (same diagnosis + prior illness)
            $table->unique(['diagnosis_id', 'priorillness_id'], 'diagnosis_priorillness_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diagnosis_priorillnesses');
    }
};
