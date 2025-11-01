<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Disease;

class DiseaseController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:diseases,name',
        ]);
        $disease = Disease::create(['name' => $request->name]);
        return back()->with([
            'disease' => $disease,
        ]);
    }
}