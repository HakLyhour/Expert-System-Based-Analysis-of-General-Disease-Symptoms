<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Services\PythonMl;
use Illuminate\Support\Str;

class DiagnosisController extends Controller
{
    /**
     * Normalize names for matching across DB and ML
     */
    private function normalizeName(?string $name): ?string
    {
        if (!$name) return null;

        // 1. Replace curly/special quotes and dashes
        $normalized = Str::of($name)
            ->replace(["’", "‘", "“", "”"], ["'", "'", "\"", "\""]) // curly → straight
            ->lower()
            ->trim()
            ->__toString();

        // 2. Remove accents (convert é → e, ü → u, etc.)
        $normalized = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $normalized);

        // 3. Collapse multiple spaces and lowercase
        $normalized = preg_replace('/\s+/', ' ', $normalized);

        return strtolower(trim($normalized));
    }

    public function store(Request $req)
    {
        $data = $req->validate([
            'ageRange'         => 'nullable|string',
            'weight'           => 'nullable|string',
            'mainSymptom'      => 'array',
            'mainSymptom.*'    => 'string',
            'priorIllnesses'   => 'array',
            'priorIllnesses.*' => 'string',
        ]);

        // 1) Run ML
        $ml = PythonMl::predict(
            $data['mainSymptom'] ?? [],
            $data['priorIllnesses'] ?? []
        );

        $prediction   = $ml['prediction'] ?? null;
        $confidence   = $ml['confidence'] ?? null;
        $alternatives = $ml['top3'] ?? [];

        // 2) Resolve disease_id (normalize quotes)
        $diseaseId = null;
        if (!empty($prediction)) {
            $normalizedPrediction = Str::of($prediction)
                ->replace(["’", "‘"], "'")
                ->replace(["“", "”"], '"')
                ->lower()
                ->trim();

            $diseaseId = DB::table('diseases')
                ->whereRaw("LOWER(REPLACE(REPLACE(diseases_name, '’', ''''), '‘', '''')) = ?", [$normalizedPrediction])
                ->value('id');
        }

        // If still not found, set prediction to "Unknown"
        if (!$diseaseId) {
            $prediction = "Unknown";
            $diseaseId = DB::table('diseases')
                ->where('diseases_name', 'Unknown')
                ->value('id');
        }

        // 3) Insert into diagnosis
        $diagnosisId = DB::table('diagnosis')->insertGetId([
            'user_id'          => Auth::id(),
            'disease_id'       => $diseaseId,   // null if not found
            'diagnosis_date'   => now(),
            'confidence_score' => $confidence,
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);

        // 4) Save logs (top-3 predictions)
        foreach ($alternatives as $rank => $alt) {
            DB::table('diagnosis_logs')->insert([
                'diagnosis_id'  => $diagnosisId,
                'step'          => $rank + 1,
                'sender'        => 'system',
                'action'        => 'analysis',
                'message'       => "Predicted: {$alt['disease']} ({$alt['confidence']})",
                'is_final_step' => $rank === 0,
                'user_feedback' => false,
                'created_at'    => now(),
            ]);
        }

        // 5) Pivot: symptoms
        $symptomRecords = [];
        foreach ($data['mainSymptom'] ?? [] as $symptomName) {
            $symptomId = DB::table('symptoms')->where('name', $symptomName)->value('id');
            if ($symptomId) {
                DB::table('diagnosis_symptoms')->insert([
                    'diagnosis_id' => $diagnosisId,
                    'symptom_id'   => $symptomId,
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ]);
                $symptomRecords[] = ['name' => $symptomName];
            }
        }

        // 6) Pivot: prior illnesses
        $illnessRecords = [];
        foreach ($data['priorIllnesses'] ?? [] as $illnessName) {
            $illnessId = DB::table('priorillnesses')
                ->where('priorillness_name', $illnessName)
                ->value('id');
            if ($illnessId) {
                DB::table('diagnosis_priorillnesses')->insert([
                    'diagnosis_id'    => $diagnosisId,
                    'priorillness_id' => $illnessId,
                    'created_at'      => now(),
                    'updated_at'      => now(),
                ]);
                $illnessRecords[] = ['priorillness_name' => $illnessName];
            }
        }

        // 7) Treatments (only if disease exists in v_knowledgebases)
        $treatments = [];
        if ($diseaseId && !empty($prediction)) {
            $csv = DB::table('v_knowledgebases')
                ->where('disease', $prediction)
                ->value('treatments');

            if ($csv) {
                $treatments = collect(preg_split('/[;,]+/', $csv))
                    ->map(fn($s) => trim($s))
                    ->filter()
                    ->unique()
                    ->values()
                    ->all();

                foreach ($treatments as $treatmentDesc) {
                    $treatmentId = DB::table('treatments')
                        ->where('description', $treatmentDesc)
                        ->value('id');

                    if (!$treatmentId) {
                        $treatmentId = DB::table('treatments')->insertGetId([
                            'description' => $treatmentDesc,
                            'created_at'  => now(),
                            'updated_at'  => now(),
                        ]);
                    }

                    DB::table('diagnosis_treatments')->insert([
                        'diagnosis_id' => $diagnosisId,
                        'treatment_id' => $treatmentId,
                        'created_at'   => now(),
                        'updated_at'   => now(),
                    ]);
                }
            }
        }

        // 8) Return props for React
        return Inertia::render('WelcomePage/resultspage', [
            'formData'   => [
                'ageRange'       => $data['ageRange'] ?? null,
                'weight'         => $data['weight'] ?? null,
                'mainSymptom'    => $data['mainSymptom'] ?? [],
                'priorIllnesses' => $data['priorIllnesses'] ?? [],
            ],
            'diagnosis'  => [
                'id'               => $diagnosisId,
                'disease'          => ['diseases_name' => $prediction ?? 'Unknown'],
                'confidence_score' => $confidence,
                'symptoms'         => $symptomRecords,
                'priorillnesses'   => $illnessRecords,
                'treatments'       => array_map(fn($t) => ['description' => $t], $treatments),
                'alternatives'     => $alternatives,
            ],
        ]);
    }


    public function show($id)
    {
        $diag = DB::table('diagnosis')->where('id', $id)->first();
        if (!$diag) {
            abort(404, 'Diagnosis not found.');
        }

        // Disease
        $disease = DB::table('diseases')
            ->where('id', $diag->disease_id)
            ->select('diseases_name')
            ->first();

        // Symptoms
        $symptoms = DB::table('diagnosis_symptoms as ds')
            ->join('symptoms as s', 's.id', '=', 'ds.symptom_id')
            ->where('ds.diagnosis_id', $id)
            ->select('s.name')
            ->get()
            ->map(fn($row) => ['name' => $this->normalizeName($row->name)])
            ->toArray();

        // Prior illnesses
        $priorIllnesses = DB::table('diagnosis_priorillnesses as dpi')
            ->join('priorillnesses as p', 'p.id', '=', 'dpi.priorillness_id')
            ->where('dpi.diagnosis_id', $id)
            ->select('p.priorillness_name')
            ->get()
            ->map(fn($row) => ['priorillness_name' => $this->normalizeName($row->priorillness_name)])
            ->toArray();

        // Treatments
        $treatments = DB::table('diagnosis_treatments as dt')
            ->join('treatments as t', 't.id', '=', 'dt.treatment_id')
            ->where('dt.diagnosis_id', $id)
            ->select('t.description')
            ->get()
            ->map(fn($row) => ['description' => $this->normalizeName($row->description)])
            ->toArray();

        // Alternatives
        $alternatives = DB::table('diagnosis_logs')
            ->where('diagnosis_id', $id)
            ->where('step', '>', 1)
            ->select('message')
            ->get()
            ->map(function ($row) {
                if (preg_match('/Predicted: (.+) \(([\d.]+)\)/', $row->message, $m)) {
                    return [
                        'disease'    => $this->normalizeName($m[1]),
                        'confidence' => (float) $m[2]
                    ];
                }
                return null;
            })
            ->filter()
            ->values()
            ->toArray();

        return Inertia::render('WelcomePage/resultspage', [
            'diagnosis' => [
                'id'               => $diag->id,
                'disease'          => ['diseases_name' => $this->normalizeName($disease->diseases_name ?? 'Unknown')],
                'confidence_score' => $diag->confidence_score,
                'symptoms'         => $symptoms,
                'priorillnesses'   => $priorIllnesses,
                'treatments'       => $treatments,
                'alternatives'     => $alternatives,
            ],
        ]);
    }
}










// namespace App\Http\Controllers\Api;

// use App\Http\Controllers\Controller;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\DB;
// use Inertia\Inertia;
// use Illuminate\Support\Facades\Auth;
// use App\Services\PythonMl;

// class DiagnosisController extends Controller
// {
//     // helper: normalize name (quotes/dashes)
//     private function normalizeName(string $text): string
//     {
//         return str_replace(
//             ["’", "‘", "“", "”", "–"],
//             ["'", "'", '"', '"', "-"],
//             trim($text)
//         );
//     }
//     public function store(Request $req)
//     {
//         $data = $req->validate([
//             'ageRange'         => 'nullable|string',
//             'weight'           => 'nullable|string',
//             'mainSymptom'      => 'array',
//             'mainSymptom.*'    => 'string',
//             'priorIllnesses'   => 'array',
//             'priorIllnesses.*' => 'string',
//         ]);

//         // 1) Run ML
//         $ml = PythonMl::predict(
//             $data['mainSymptom'] ?? [],
//             $data['priorIllnesses'] ?? []
//         );

//         $prediction   = $ml['prediction'] ?? null;
//         $confidence   = $ml['confidence'] ?? null;
//         $alternatives = $ml['top3'] ?? [];

//         // 2) Resolve disease_id
//         $diseaseId = null;
//         if (!empty($prediction)) {

//             // normalize quotes/dashes
//             $normalized = $this->normalizeName($prediction);

//             $diseaseId = DB::table('diseases')
//                 ->whereRaw('LOWER(diseases_name) = ?', [strtolower($normalized)])
//                 ->value('id');

//             if (!$diseaseId) {
//                 $diseaseId = DB::table('diseases')->insertGetId([
//                     'diseases_name' => $normalized,
//                     'created_at'    => now(),
//                     'updated_at'    => now(),
//                 ]);
//             }
//         }

//         // 3) Insert into diagnosis
//         $diagnosisId = DB::table('diagnosis')->insertGetId([
//             'user_id'          => Auth::id(),
//             'disease_id'       => $diseaseId,
//             'diagnosis_date'   => now(),
//             'confidence_score' => $confidence,
//             'created_at'       => now(),
//             'updated_at'       => now(),
//         ]);

//         // 4) Save logs (top-3)
//         foreach ($alternatives as $rank => $alt) {
//             DB::table('diagnosis_logs')->insert([
//                 'diagnosis_id'  => $diagnosisId,
//                 'step'          => $rank + 1,
//                 'sender'        => 'system',
//                 'action'        => 'analysis',
//                 'message'       => "Predicted: {$alt['disease']} ({$alt['confidence']})",
//                 'is_final_step' => $rank === 0,
//                 'user_feedback' => false,
//                 'created_at'    => now(),
//             ]);
//         }

//         // 5) Pivot: symptoms
//         $symptomRecords = [];
//         foreach ($data['mainSymptom'] ?? [] as $symptomName) {
//             $symptomId = DB::table('symptoms')->where('name', $symptomName)->value('id');
//             if ($symptomId) {
//                 DB::table('diagnosis_symptoms')->insert([
//                     'diagnosis_id' => $diagnosisId,
//                     'symptom_id'   => $symptomId,
//                     'created_at'   => now(),
//                     'updated_at'   => now(),
//                 ]);
//                 $symptomRecords[] = ['name' => $symptomName];
//             }
//         }

//         // 6) Pivot: prior illnesses
//         $illnessRecords = [];
//         foreach ($data['priorIllnesses'] ?? [] as $illnessName) {
//             $illnessId = DB::table('priorillnesses')
//                 ->where('priorillness_name', $illnessName)
//                 ->value('id');
//             if ($illnessId) {
//                 DB::table('diagnosis_priorillnesses')->insert([
//                     'diagnosis_id'    => $diagnosisId,
//                     'priorillness_id' => $illnessId,
//                     'created_at'      => now(),
//                     'updated_at'      => now(),
//                 ]);
//                 $illnessRecords[] = ['priorillness_name' => $illnessName];
//             }
//         }

//         // 7) Treatments from v_knowledgebases
//         $treatments = [];
//         if (!empty($prediction)) {
//             $csv = DB::table('v_knowledgebases')
//                 ->where('disease', $prediction)
//                 ->value('treatments');

//             if ($csv) {
//                 $treatments = collect(preg_split('/[;,]+/', $csv))
//                     ->map(fn($s) => trim($s))
//                     ->filter()
//                     ->unique()
//                     ->values()
//                     ->all();

//                 foreach ($treatments as $treatmentDesc) {
//                     $treatmentId = DB::table('treatments')
//                         ->where('description', $treatmentDesc)
//                         ->value('id');

//                     if (!$treatmentId) {
//                         $treatmentId = DB::table('treatments')->insertGetId([
//                             'description' => $treatmentDesc,
//                             'created_at'  => now(),
//                             'updated_at'  => now(),
//                         ]);
//                     }

//                     DB::table('diagnosis_treatments')->insert([
//                         'diagnosis_id' => $diagnosisId,
//                         'treatment_id' => $treatmentId,
//                         'created_at'   => now(),
//                         'updated_at'   => now(),
//                     ]);
//                 }
//             }
//         }

//         // 8) Return props in the shape React expects
//         return Inertia::render('WelcomePage/resultspage', [
//             'formData'   => [
//                 'ageRange'       => $data['ageRange'] ?? null,
//                 'weight'         => $data['weight'] ?? null,
//                 'mainSymptom'    => $data['mainSymptom'] ?? [],
//                 'priorIllnesses' => $data['priorIllnesses'] ?? [],
//             ],
//             'diagnosis'  => [
//                 'id'               => $diagnosisId,
//                 'disease'          => ['diseases_name' => $prediction ?? 'Unknown'],
//                 'confidence_score' => $confidence,
//                 'symptoms'         => $symptomRecords,
//                 'priorillnesses'   => $illnessRecords,
//                 'treatments'       => array_map(fn($t) => ['description' => $t], $treatments),
//                 'alternatives'     => $alternatives,
//             ],
//         ]);
//     }

//     public function show($id)
//     {
//         $diag = DB::table('diagnosis')->where('id', $id)->first();
//         if (!$diag) {
//             abort(404, 'Diagnosis not found.');
//         }

//         // Disease name
//         $disease = DB::table('diseases')
//             ->where('id', $diag->disease_id)
//             ->select('diseases_name')
//             ->first();

//         // Symptoms
//         $symptoms = DB::table('diagnosis_symptoms as ds')
//             ->join('symptoms as s', 's.id', '=', 'ds.symptom_id')
//             ->where('ds.diagnosis_id', $id)
//             ->select('s.name')
//             ->get()
//             ->map(fn($row) => ['name' => $row->name])
//             ->toArray();

//         // Prior illnesses
//         $priorIllnesses = DB::table('diagnosis_priorillnesses as dpi')
//             ->join('priorillnesses as p', 'p.id', '=', 'dpi.priorillness_id')
//             ->where('dpi.diagnosis_id', $id)
//             ->select('p.priorillness_name')
//             ->get()
//             ->map(fn($row) => ['priorillness_name' => $row->priorillness_name])
//             ->toArray();

//         // Treatments
//         $treatments = DB::table('diagnosis_treatments as dt')
//             ->join('treatments as t', 't.id', '=', 'dt.treatment_id')
//             ->where('dt.diagnosis_id', $id)
//             ->select('t.description')
//             ->get()
//             ->map(fn($row) => ['description' => $row->description])
//             ->toArray();

//         // Alternatives (logs → just demonstration)
//         $alternatives = DB::table('diagnosis_logs')
//             ->where('diagnosis_id', $id)
//             ->where('step', '>', 1)
//             ->select('message') // your logs store as "Predicted: Disease (confidence)"
//             ->get()
//             ->map(function ($row) {
//                 if (preg_match('/Predicted: (.+) \(([\d.]+)\)/', $row->message, $m)) {
//                     return ['disease' => $m[1], 'confidence' => (float) $m[2]];
//                 }
//                 return null;
//             })
//             ->filter()
//             ->values()
//             ->toArray();

//         return Inertia::render('WelcomePage/resultspage', [
//             'diagnosis' => [
//                 'id'               => $diag->id,
//                 'disease'          => ['diseases_name' => $disease->diseases_name ?? 'Unknown'],
//                 'confidence_score' => $diag->confidence_score,
//                 'symptoms'         => $symptoms,
//                 'priorillnesses'   => $priorIllnesses,
//                 'treatments'       => $treatments,
//                 'alternatives'     => $alternatives,
//             ],
//         ]);
//     }
// }
