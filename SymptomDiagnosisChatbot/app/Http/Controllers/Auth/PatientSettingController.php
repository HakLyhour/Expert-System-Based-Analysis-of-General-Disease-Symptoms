<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\DiagnosisLog;

class PatientSettingController extends Controller
{
    /**
     * Display patient settings + diagnosis history.
     */
    public function index()
    {
        $user = Auth::user();

        // Join diagnosis_logs -> diagnosis -> diseases to get disease name as label
        $recentLogs = DiagnosisLog::query()
            ->join('diagnosis', 'diagnosis_logs.diagnosis_id', '=', 'diagnosis.id')
            ->join('diseases', 'diagnosis.disease_id', '=', 'diseases.id')
            ->where('diagnosis.user_id', $user->id)
            ->orderByDesc('diagnosis_logs.created_at')
            ->limit(10)
            ->get([
                'diagnosis_logs.id',
                'diagnosis_logs.diagnosis_id',
                'diagnosis_logs.step',
                'diagnosis_logs.is_final_step',
                'diseases.diseases_name as label',
                'diagnosis_logs.created_at'
            ])
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'diagnosis_id' => $log->diagnosis_id,
                    'step' => $log->step,
                    'is_final_step' => (bool) $log->is_final_step,
                    'label' => $log->label,
                    'date' => optional($log->created_at)->format('Y-m-d H:i'),
                ];
            });

        return Inertia::render('SettingPage/SettingPatientPage', [
            'user' => [
                'id'    => $user->id,
                'user_name'  => $user->user_name ?? $user->name ?? '',
                'email' => $user->email,
                'date_of_birth' => $user->date_of_birth ?? null,
                'weight' => $user->weight ?? null,
                'height' => $user->height ?? null,
                'image' => $user->image ?? null,
            ],
            'recentLogs' => $recentLogs,
        ]);
    }
}
