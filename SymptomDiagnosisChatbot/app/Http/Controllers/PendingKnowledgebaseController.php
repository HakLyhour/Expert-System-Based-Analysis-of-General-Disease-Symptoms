<?php
// app/Http/Controllers/PendingKnowledgebaseController.php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\PendingKnowledgebase;
use App\Models\Disease;
use App\Models\Knowledgebase;
use App\Models\Treatment;
use App\Models\User;
use Illuminate\Http\Request;

class PendingKnowledgebaseController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'disease_name' => 'required|string|max:255',
            'disease_type' => 'required|string',
            'disease_description' => 'required|string',
            'symptom_ids' => 'required|array|min:1',
            'symptom_ids.*' => 'exists:symptoms,id',
            'treatment_description' => 'required|string',
            'priorillness_ids' => 'nullable|array|min:1',
            'priorillness_ids.*' => 'exists:priorillnesses,id',
        ]);

        $pending = PendingKnowledgebase::create([
            'disease_name' => $validated['disease_name'],
            'disease_type' => $validated['disease_type'],
            'disease_description' => $validated['disease_description'],
            'symptom_ids' => $validated['symptom_ids'],
            'treatment_description' => $validated['treatment_description'],
            'priorillness_ids' => $validated['priorillness_ids'],
            'doctor_id' => Auth::id(),
        ]);

        return back()->with('success', 'Knowledgebase request sent to admin for approval.');
    }

    public function index()
    {
        // load pending items with doctor relation
        $pending = PendingKnowledgebase::with('doctor')
            ->where('status', 'pending')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'disease_name' => $item->disease_name,
                    'disease_type' => $item->disease_type,
                    'disease_description' => $item->disease_description,
                    // use model accessors that return names arrays
                    'symptoms' => $item->symptom_names ?? [],
                    'treatment' => $item->treatment_description,
                    'priorillnesses' => $item->priorillness_names ?? [],
                    // map doctor.user_name -> name so frontend can use doctor.name
                    'doctor' => $item->doctor ? [
                        'id' => $item->doctor->id,
                        'name' => $item->doctor->user_name ?? $item->doctor->name ?? null,
                    ] : null,
                    'created_at' => $item->created_at ? $item->created_at->toDateTimeString() : null,
                ];
            });

        return inertia('AdminPage/PendingKnowledgebases', [
            'pending' => $pending,
        ]);
    }

    public function approve($id)
    {
        $pending = PendingKnowledgebase::findOrFail($id);

        DB::transaction(function () use ($pending) {
            // Create disease
            $disease = Disease::create([
                'diseases_name' => $pending->disease_name,
                'type' => $pending->disease_type,
                'description' => $pending->disease_description,
            ]);

            // Create treatment
            $treatment = Treatment::create([
                'description' => $pending->treatment_description,
            ]);

            // Create knowledgebase
            $knowledgebase = Knowledgebase::create([
                'disease_id' => $disease->id,
            ]);

            // Attach symptoms
            $knowledgebase->symptoms()->attach($pending->symptom_ids);

            // Attach treatment
            $knowledgebase->treatments()->attach($treatment->id);

            // Attach priorillnesses
            $knowledgebase->priorillnesses()->attach($pending->priorillness_ids);

            // Mark as approved and delete
            $pending->update(['status' => 'approved']);
            $pending->delete();
        });

        return back()->with('success', 'Knowledgebase approved and published.');
    }

    public function reject($id)
    {
        $pending = PendingKnowledgebase::findOrFail($id);
        $pending->update(['status' => 'rejected']);
        $pending->delete();
        
        return back()->with('info', 'Knowledgebase request rejected.');
    }

    public function show($id)
    {
        $pending = PendingKnowledgebase::with('doctor')->findOrFail($id);

        return inertia('AdminPage/PendingKnowledgebase/Show', [
            'pending' => [
                'id' => $pending->id,
                'disease_name' => $pending->disease_name,
                'disease_type' => $pending->disease_type,
                'disease_description' => $pending->disease_description,
                'symptom_ids' => $pending->symptom_ids,
                'symptoms' => $pending->symptom_names,
                'treatment_description' => $pending->treatment_description,
                'priorillness_ids' => $pending->priorillness_ids,
                'priorillnesses' => $pending->priorillness_names,
                'doctor' => $pending->doctor ? ['id' => $pending->doctor->id, 'name' => $pending->doctor->name] : null,
                'doctor_name' => $pending->doctor ? $pending->doctor->name : null,
                'created_at' => $pending->created_at->toDateTimeString(),
            ],
        ]);
    }
}