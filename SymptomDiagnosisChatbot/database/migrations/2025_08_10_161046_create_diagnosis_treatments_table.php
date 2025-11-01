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
        Schema::create('diagnosis_treatments', function (Blueprint $table) {
            $table->foreignId('diagnosis_id')->constrained('diagnosis')->cascadeOnDelete();
            $table->foreignId('treatment_id')->constrained('treatments')->cascadeOnDelete();
            $table->primary(['diagnosis_id', 'treatment_id']);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('diagnosis_treatments');
    }
};
