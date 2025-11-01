<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Symptom;
use App\Models\Priorillness;

class SymptomController extends Controller
{
    /* public function index()
    {
        return response()->json(Symptom::pluck('name'));
    } */

    public function index()
    {
        // Eager load knowledgebases and their diseases
        $symptoms = Symptom::with(['knowledgebases.disease'])
            ->orderBy('name')
            ->get()
            ->map(function ($symptom) {
                // Get the first disease from knowledgebases
                $disease = $symptom->knowledgebases->first()?->disease;

                return [
                    'id' => $symptom->id,
                    'name' => $symptom->name,
                    'disease' => $disease ? [
                        'id' => $disease->id,
                        'disease_name' => $disease->diseases_name,
                    ] : null,
                    'created_at' => $symptom->created_at,
                    'updated_at' => $symptom->updated_at,
                ];
            });

        return inertia('EditSymptom/EditSymptomPage', [
            'symptoms' => $symptoms,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:symptoms,name',
        ]);
        $symptom = Symptom::create(['name' => $request->name]);
        //return response()->json($symptom);
        return back()->with([
            //'success' => 'Symptom created successfully.',
            'symptom' => $symptom,
        ]);
    }

    public function update(Request $request, $id)
    {
        $symptom = Symptom::findOrFail($id);

        // Validate name: unique except this row
        $request->validate([
            'name' => 'required|string|unique:symptoms,name,' . $symptom->id,
        ]);

        $symptom->name = $request->name;
        $symptom->save();

        return back()->with([
            'success' => 'Symptom updated successfully.',
            'symptom' => $symptom,
        ]);
    }

    /**
     * (Optional) Delete a symptom.
     * Uncomment route and method if you want to enable deletion.
     */
    // public function destroy($id)
    // {
    //     $symptom = Symptom::findOrFail($id);
    //     $symptom->delete();
    //
    //     return back()->with('success', 'Symptom deleted.');
    // }

    /**
     * Your existing symptomFormPage that serves the public symptom form (knowledge base / symptom page)
     */


    public function symptomFormPage()
    {
        $symptoms = Symptom::pluck('name');
        $priorIllnesses = Priorillness::pluck('priorillness_name');
        return inertia('WelcomePage/SymptomPage', [
            'symptoms' => $symptoms,
            'priorIllnesses' => $priorIllnesses,
        ]);
    }
}
