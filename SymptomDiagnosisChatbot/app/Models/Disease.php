<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Symptom;

class Disease extends Model
{
    protected $table = 'diseases';

    protected $fillable = [
        'diseases_name',
        'type',
        'description',
    ];
    // protected $primaryKey = 'disease_id'; // use default 'id'

    public function knowledgeBase()
    {
        return $this->hasOne(KnowledgeBase::class, 'disease_id', 'disease_id');
    }

    public function symptoms()
    {
        return $this->belongsToMany(
            Symptom::class,
            'diagnosis_symptoms',
            'diagnosis_id', // Foreign key on the pivot table for Disease
            'symptom_id'    // Foreign key on the pivot table for Symptom
        );
    }
}
