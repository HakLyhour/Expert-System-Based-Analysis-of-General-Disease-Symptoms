<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Knowledgebase extends Model
{
    protected $fillable = [
        'disease_id',
    ];

    public function disease()
    {
        return $this->belongsTo(Disease::class, 'disease_id', 'id');
    }

    public function symptoms()
    {
        return $this->belongsToMany(Symptom::class, 'knowledgebase_symptom');
    }

    public function treatments()
    {
        return $this->belongsToMany(Treatment::class, 'knowledgebase_treatment');
    }

    public function priorillnesses()
    {
        return $this->belongsToMany(Priorillness::class, 'knowledgebase_priorillness');
    }
}
