<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class Diagnosis extends Model
{
    use SoftDeletes;

    // your migration uses table name "diagnosis" (singular)
    protected $table = 'diagnosis';

    protected $fillable = [
        'user_id',
        'disease_id',
        'diagnosis_date',
        'confidence_score',
    ];

    // ensure diagnosis_date is cast to Carbon
    protected $dates = ['diagnosis_date', 'created_at', 'updated_at'];

    public function logs(): HasMany
    {
        return $this->hasMany(DiagnosisLog::class, 'diagnosis_id');
    }
}
