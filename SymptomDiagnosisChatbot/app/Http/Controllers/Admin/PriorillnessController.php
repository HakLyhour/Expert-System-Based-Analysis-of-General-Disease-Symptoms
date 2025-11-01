<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Priorillness;

class PriorillnessController extends Controller
{
    /**
     * Store a newly created priorillness in storage.
     */
    // public function index()
    // {
    //     return inertia('EditPriorIllness/EditPriorIllnessPage', [
    //         'priorIllnesses' => Priorillness::orderBy('id','desc')->get(),
    //     ]);
    // }
    public function index()
    {
        // Eager load knowledgebases and their diseases
        $priorIllnesses = Priorillness::with(['knowledgebases.disease'])
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($priorIllness) {
                // Get the first disease from knowledgebases
                $disease = $priorIllness->knowledgebases->first()?->disease;
                
                return [
                    'id' => $priorIllness->id,
                    'priorillness_name' => $priorIllness->priorillness_name,
                    'disease' => $disease ? [
                        'id' => $disease->id,
                        'disease_name' => $disease->diseases_name,
                    ] : null,
                    'created_at' => $priorIllness->created_at,
                    'updated_at' => $priorIllness->updated_at,
                ];
            });

        return inertia('EditPriorIllness/EditPriorIllnessPage', [
            'priorIllnesses' => $priorIllnesses,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'priorillness_name' => 'required|string|unique:priorillnesses,priorillness_name',
        ]);
        $priorillness = Priorillness::create($data);

        // Return the new priorillness for frontend update
        return back()->with([
            'priorillness' => $priorillness,
        ]);
    }
    public function update(Request $request, $id)
    {
        $priorIllness = Priorillness::findOrFail($id);
        $validated = $request->validate([
            'priorillness_name' => 'required|string|unique:priorillnesses,priorillness_name,' . $priorIllness->id,
        ]);
        $priorIllness->update($validated);
        return back()->with('success','Prior illness updated!');
    }
}