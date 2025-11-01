<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Drop the unique index first (try both common names, ignore errors if not found)
        try { DB::statement('ALTER TABLE treatments DROP INDEX treatments_description_unique'); } catch (\Exception $e) {}
        try { DB::statement('ALTER TABLE treatments DROP INDEX treatments_description_uindex'); } catch (\Exception $e) {}
        Schema::table('treatments', function (Blueprint $table) {
            $table->text('description')->change();
        });
        // Recreate unique index with length 191 (safe for utf8mb4)
        DB::statement('ALTER TABLE treatments ADD UNIQUE treatments_description_unique (description(191))');
    }

    public function down()
    {
        Schema::table('treatments', function (Blueprint $table) {
            $table->dropUnique(['description']);
        });
        Schema::table('treatments', function (Blueprint $table) {
            $table->string('description', 255)->change();
        });
        // Recreate original unique index (no length) for rollback
        DB::statement('ALTER TABLE treatments ADD UNIQUE treatments_description_unique (description)');
    }
};