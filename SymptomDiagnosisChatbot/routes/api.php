<?php
 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
 
use App\Http\Controllers\Api\DiagnosisController;

Route::post('/diagnose-test', function () {
    $data = request()->validate([
        'ageRange'        => 'nullable|string',
        'weight'          => 'nullable|string',
        'mainSymptom'     => 'array',
        'mainSymptom.*'   => 'string',
        'priorIllnesses'  => 'array',
        'priorIllnesses.*'=> 'string',
    ]);
    
    // Call Python locally
    $ml = \App\Services\PythonMl::predict(
        $data['mainSymptom'] ?? [],
        $data['priorIllnesses'] ?? []
    );
    
    return response()->json($ml);
});
