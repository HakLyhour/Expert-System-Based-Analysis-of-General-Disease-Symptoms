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
        Schema::create('knowledgebase_priorillness', function (Blueprint $table) {
            $table->foreignId('knowledgebase_id')->constrained('knowledgebases')->cascadeOnDelete();
            $table->foreignId('priorillness_id')->constrained('priorillnesses')->cascadeOnDelete();
            $table->primary(['knowledgebase_id', 'priorillness_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('knowledgebase_priorillness');
    }
};
