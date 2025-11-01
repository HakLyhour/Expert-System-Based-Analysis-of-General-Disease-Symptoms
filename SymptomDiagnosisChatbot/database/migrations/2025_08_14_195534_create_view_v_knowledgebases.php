<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Create or replace the view that expands foreign keys to readable strings
        DB::statement(<<<SQL
CREATE OR REPLACE VIEW v_knowledgebases AS
SELECT
    kb.id                                   AS knowledgebase_id,
    d.diseases_name                         AS disease,
    -- aggregated related names/descriptions
    GROUP_CONCAT(DISTINCT s.name ORDER BY s.name SEPARATOR ', ')                 AS symptoms,
    GROUP_CONCAT(DISTINCT t.description ORDER BY t.description SEPARATOR '; ')   AS treatments,
    GROUP_CONCAT(DISTINCT p.priorillness_name ORDER BY p.priorillness_name SEPARATOR ', ') AS priorillnesses,
    kb.created_at,
    kb.updated_at
FROM knowledgebases kb
LEFT JOIN diseases d
    ON d.id = kb.disease_id

LEFT JOIN knowledgebase_symptom kbs
    ON kbs.knowledgebase_id = kb.id
LEFT JOIN symptoms s
    ON s.id = kbs.symptom_id

LEFT JOIN knowledgebase_treatment kbt
    ON kbt.knowledgebase_id = kb.id
LEFT JOIN treatments t
    ON t.id = kbt.treatment_id

LEFT JOIN knowledgebase_priorillness kbp
    ON kbp.knowledgebase_id = kb.id
LEFT JOIN priorillnesses p
    ON p.id = kbp.priorillness_id

GROUP BY
    kb.id, d.diseases_name, kb.created_at, kb.updated_at
SQL);
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS v_knowledgebases');
    }
};
