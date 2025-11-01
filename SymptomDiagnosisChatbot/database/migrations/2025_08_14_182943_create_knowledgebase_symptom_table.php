<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('knowledgebase_symptom', function (Blueprint $table) {
            $table->foreignId('knowledgebase_id')
                  ->constrained('knowledgebases')
                  ->cascadeOnDelete();

            $table->foreignId('symptom_id')
                  ->constrained('symptoms')
                  ->cascadeOnDelete();

            $table->primary(['knowledgebase_id', 'symptom_id']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledgebase_symptom');
    }
};
