<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Priorillness extends Model
{
    protected $fillable = [
        'priorillness_name',
    ];

    /**
     * Get the knowledgebases associated with this prior illness
     */
    public function knowledgebases()
    {
        return $this->belongsToMany(
            Knowledgebase::class,
            'knowledgebase_priorillness',
            'priorillness_id',
            'knowledgebase_id'
        )->withTimestamps();
    }

    /**
     * Get the disease through knowledgebase (if exists)
     * Returns the first associated disease
     */
    public function disease()
    {
        return $this->knowledgebases()
            ->with('disease')
            ->first()?->disease;
    }

    /**
     * Accessor to get disease name directly
     */
    public function getDiseaseNameAttribute()
    {
        $disease = $this->disease();
        return $disease ? $disease->diseases_name : null;
    }
}