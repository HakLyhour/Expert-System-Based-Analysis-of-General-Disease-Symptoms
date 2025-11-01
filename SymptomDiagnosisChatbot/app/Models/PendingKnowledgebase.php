<?php
// app/Models/PendingKnowledgebase.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class PendingKnowledgebase extends Model
{
    // allow mass assignment if needed (adjust fields to your app)
    protected $fillable = [
        'doctor_id',
        'disease_name',
        'disease_type',
        'disease_description',
        'symptom_ids',
        'treatment_description',
        'priorillness_ids',
        'status',
    ];

    // cast JSON columns to arrays so frontend receives arrays
    protected $casts = [
        'symptom_ids' => 'array',
        'priorillness_ids' => 'array',
    ];

    // relation to user (doctor)
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    // Helper to get symptom names
    public function getSymptomNamesAttribute()
    {
        return Symptom::whereIn('id', $this->symptom_ids)->pluck('name')->toArray();
    }

    // Helper to get priorillness names
    public function getPriorillnessNamesAttribute()
    {
        return Priorillness::whereIn('id', $this->priorillness_ids)->pluck('priorillness_name')->toArray();
    }
}