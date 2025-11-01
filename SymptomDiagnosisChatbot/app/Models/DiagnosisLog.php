<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DiagnosisLog extends Model
{
    protected $table = 'diagnosis_logs';

    // We used a custom created_at field in migration; Eloquent's timestamps can be false
    public $timestamps = false;

    protected $fillable = [
        'diagnosis_id',
        'step',
        'sender',
        'action',
        'message',
        'created_at',
        'is_final_step',
        'user_feedback',
    ];

    public function diagnosis(): BelongsTo
    {
        return $this->belongsTo(Diagnosis::class, 'diagnosis_id');
    }
}
