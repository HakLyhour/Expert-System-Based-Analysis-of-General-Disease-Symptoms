<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('pending_knowledgebases')) {
            return;
        }

        if (Schema::hasColumn('pending_knowledgebases', 'disease_id')) {
            // MySQL: make disease_id nullable
            DB::statement('ALTER TABLE `pending_knowledgebases` MODIFY `disease_id` BIGINT UNSIGNED NULL;');
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('pending_knowledgebases')) {
            return;
        }

        if (Schema::hasColumn('pending_knowledgebases', 'disease_id')) {
            // Attempt to restore NOT NULL — ensure there are no NULLs first or adjust as needed
            try {
                DB::statement('ALTER TABLE `pending_knowledgebases` MODIFY `disease_id` BIGINT UNSIGNED NOT NULL;');
            } catch (\Throwable $e) {
                // no-op: manual action may be required to reverse safely
            }
        }
    }
};