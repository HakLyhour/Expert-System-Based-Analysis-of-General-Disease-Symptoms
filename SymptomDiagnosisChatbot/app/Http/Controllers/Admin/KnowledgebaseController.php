<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Knowledgebase;
use App\Models\Disease;
use App\Models\Symptom;
use App\Models\Treatment;
use App\Models\Priorillness;
use Illuminate\Support\Facades\Log;

class KnowledgebaseController extends Controller
{
    /**
     * Display a listing of the knowledgebases with related data.
     */
    public function index()
    {
        $knowledgebases = Knowledgebase::with([
            'disease',
            'symptoms',
            'treatments',
            'priorillnesses'
        ])->get();

        $diseases = Disease::all();
        $symptoms = Symptom::all();
        $treatments = Treatment::all();
        $priorillnesses = Priorillness::all();

        Log::info('DEBUG priorillnesses count: ' . $priorillnesses->count());
        Log::info('DEBUG inertia props:', [
            'knowledgebases' => $knowledgebases->count(),
            'diseases' => $diseases->count(),
            'symptoms' => $symptoms->count(),
            'treatments' => $treatments->count(),
            'priorillnesses' => $priorillnesses->count(),
        ]);

        return inertia('KnowledgeBase/KnowledgeBasePage', [
            'knowledgebases' => $knowledgebases,
            'diseases' => $diseases,
            'symptoms' => $symptoms,
            'treatments' => $treatments,
            'priorillnesses' => $priorillnesses,
        ]);
    }

    /**
     * Store a newly created knowledgebase in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            // Disease
            'disease_name' => 'required|string',
            'disease_type' => 'required|string',
            'disease_description' => 'required|string',
            // Symptom(s)
            'symptom_ids' => 'required|array',
            'symptom_ids.*' => 'exists:symptoms,id',
            // Treatment
            'treatment_description' => 'required|string',
            // Priorillness
            'priorillness_ids' => 'nullable|array',
            'priorillness_ids.*' => 'exists:priorillnesses,id',
        ]);

        // Create or get Disease
        $disease = Disease::firstOrCreate(
            ['diseases_name' => $data['disease_name']],
            ['type' => $data['disease_type'], 'description' => $data['disease_description']]
        );

        Log::info('DEBUG created/found disease:', ['disease' => $disease, 'disease_id' => $disease->id]);
        Log::info('DEBUG disease attributes:', $disease->getAttributes());

        // Create or get Treatment
        $treatment = Treatment::firstOrCreate(
            ['description' => $data['treatment_description']]
        );

        // Log the data being inserted into knowledgebases
        Log::info('DEBUG about to create knowledgebase:', ['disease_id' => $disease->id]);

        // Create the knowledgebase entry
        $knowledgebase = Knowledgebase::create([
            'disease_id' => $disease->id,
        ]);

        // Attach symptoms
        $knowledgebase->symptoms()->sync($data['symptom_ids']);

        // Attach treatment (assuming only one treatment per knowledgebase)
        $knowledgebase->treatments()->sync([$treatment->id]);

        // Attach prior illnesses
        $knowledgebase->priorillnesses()->sync($data['priorillness_ids']);

        return redirect()->route('knowledgebases.index')->with('success', 'Knowledgebase created successfully');
    }

    /**
     * Update the specified knowledgebase in storage.
     */
    public function update(Request $request, $id)
    {
        $data = $request->validate([
            // Disease
            'disease_name' => 'required|string',
            'disease_type' => 'required|string',
            'disease_description' => 'required|string',
            // Symptom(s)
            'symptom_ids' => 'required|array',
            'symptom_ids.*' => 'exists:symptoms,id',
            // Treatment
            'treatment_description' => 'required|string',
            // Priorillness
            'priorillness_ids' => 'nullable|array',
            'priorillness_ids.*' => 'exists:priorillnesses,id',
        ]);

        // Find the knowledgebase
        $knowledgebase = Knowledgebase::findOrFail($id);

        // Update or get Disease
        $disease = Disease::firstOrCreate(
            ['diseases_name' => $data['disease_name']],
            ['type' => $data['disease_type'], 'description' => $data['disease_description']]
        );
        $knowledgebase->disease_id = $disease->id;
        $knowledgebase->save();

        // Update or get Treatment
        $treatment = Treatment::firstOrCreate(
            ['description' => $data['treatment_description']]
        );

        // Sync symptoms
        $knowledgebase->symptoms()->sync($data['symptom_ids']);

        // Sync treatment (assuming only one treatment per knowledgebase)
        $knowledgebase->treatments()->sync([$treatment->id]);

        // Sync prior illnesses
        $knowledgebase->priorillnesses()->sync($data['priorillness_ids']);

        return redirect()->route('knowledgebases.index')->with('success', 'Knowledgebase updated successfully');
    }
}