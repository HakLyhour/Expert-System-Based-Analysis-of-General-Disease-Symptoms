<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('pending_knowledgebases')) {
            Schema::create('pending_knowledgebases', function (Blueprint $table) {
                $table->id();
                $table->string('disease_name')->nullable();
                $table->string('disease_type')->nullable();
                $table->text('disease_description')->nullable();
                $table->json('symptom_ids')->nullable();
                $table->text('treatment_description')->nullable();
                $table->json('priorillness_ids')->nullable();
                $table->foreignId('doctor_id')->nullable()->constrained('users')->onDelete('cascade');
                $table->enum('status', ['pending','approved','rejected'])->default('pending');
                $table->timestamps();
            });
            return;
        }

        Schema::table('pending_knowledgebases', function (Blueprint $table) {
            if (!Schema::hasColumn('pending_knowledgebases', 'disease_name')) {
                $table->string('disease_name')->nullable()->after('id');
            }
            if (!Schema::hasColumn('pending_knowledgebases', 'disease_type')) {
                $table->string('disease_type')->nullable()->after('disease_name');
            }
            if (!Schema::hasColumn('pending_knowledgebases', 'disease_description')) {
                $table->text('disease_description')->nullable()->after('disease_type');
            }
            if (!Schema::hasColumn('pending_knowledgebases', 'symptom_ids')) {
                $table->json('symptom_ids')->nullable()->after('disease_description');
            }
            if (!Schema::hasColumn('pending_knowledgebases', 'treatment_description')) {
                $table->text('treatment_description')->nullable()->after('symptom_ids');
            }
            if (!Schema::hasColumn('pending_knowledgebases', 'priorillness_ids')) {
                $table->json('priorillness_ids')->nullable()->after('treatment_description');
            }
            if (!Schema::hasColumn('pending_knowledgebases', 'doctor_id')) {
                $table->foreignId('doctor_id')->nullable()->constrained('users')->onDelete('cascade')->after('priorillness_ids');
            }
            if (!Schema::hasColumn('pending_knowledgebases', 'status')) {
                $table->enum('status', ['pending','approved','rejected'])->default('pending')->after('doctor_id');
            }
            if (!Schema::hasColumn('pending_knowledgebases', 'created_at')) {
                $table->timestamps();
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('pending_knowledgebases')) return;

        Schema::table('pending_knowledgebases', function (Blueprint $table) {
            foreach ([
                'disease_name','disease_type','disease_description',
                'symptom_ids','treatment_description','priorillness_ids','doctor_id','status'
            ] as $col) {
                if (Schema::hasColumn('pending_knowledgebases', $col)) {
                    try { $table->dropColumn($col); } catch (\Exception $e) {}
                }
            }
        });
    }
};