<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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
        });
    }

    public function down(): void
    {
        Schema::table('pending_knowledgebases', function (Blueprint $table) {
            foreach ([
                'disease_name','disease_type','disease_description',
                'symptom_ids','treatment_description','priorillness_ids'
            ] as $col) {
                if (Schema::hasColumn('pending_knowledgebases', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};