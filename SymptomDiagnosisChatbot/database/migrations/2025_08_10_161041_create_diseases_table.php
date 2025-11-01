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
        Schema::create('diseases', function (Blueprint $table) {
            $table->id();
            $table->string('diseases_name')->unique();
            $table->enum('type', [
                'Circulatory System',
                'Respiratory System',
                'Digestive System',
                'Excretory System',
                'Immune System',
                'Reproductive System',
                'Muscular System',
                'Skeletal System',
                'Integumentary System',
                'Lymphatic System',
                'Nervous System',
                'Endocrine System'
            ]);
            $table->text('description');
            $table->timestamps();  //write pin ng vea ng create coloumns (created_at, updated_at)
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diseases');
    }
};
