<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Disease; // Adjust this if your disease table/model has a different name
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\PendingKnowledgebase;
use Illuminate\Support\Str;

class DashboardController extends Controller
{
    public function index()
    {
        // Total counts (dynamic)
        $totalPatients = User::where('role', 'patient')->count();
        $totalDoctors = User::where('role', 'doctor')->count();
        $totalDiseases = Disease::count();

        // Calculate percentages
        $totalUsers = $totalPatients + $totalDoctors;
        $patientPercentage = $totalUsers > 0 ? round(($totalPatients / $totalUsers) * 100, 1) : 0;
        $doctorPercentage = $totalUsers > 0 ? round(($totalDoctors / $totalUsers) * 100, 1) : 0;
        $diseasePercentage = $totalUsers > 0 ? round(($totalDiseases / $totalUsers) * 100, 1) : 0;

        // Weekly Patient Trend (example: patients registered per day, last 7 days)
        $weeklyPatientTrend = collect(range(6, 0))->map(function ($daysAgo) {
            $date = now()->subDays($daysAgo)->toDateString();
            return [
                'name' => \Carbon\Carbon::parse($date)->format('D'),
                'value' => User::whereDate('created_at', $date)
                    ->where('role', 'patient')
                    ->count(),
            ];
        });

        // Disease Types breakdown (pie chart)
        $diseaseTypes = Disease::select('type', DB::raw('count(*) as total'))
            ->groupBy('type')
            ->get();

        // Choose your own color scheme
        $colors = ['#3182ce', '#68d391', '#ed8936', '#f56565', '#ecc94b', '#38b2ac'];
        $pieData = $diseaseTypes->map(function ($item, $i) use ($diseaseTypes, $colors) {
            $total = $diseaseTypes->sum('total');
            return [
                'name' => $item->type,
                'percentage' => round(($item->total / $total) * 100, 1),
                'color' => $colors[$i % count($colors)],
            ];
        });

        // add pending notifications for dashboard modal
        $pendingNotifications = PendingKnowledgebase::with('doctor')
            ->where('status', 'pending')
            ->orderByDesc('created_at')
            ->take(20)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'disease_name' => $p->disease_name,
                    'disease_type' => $p->disease_type,
                    'disease_description' => Str::limit($p->disease_description ?? $p->treatment_description ?? '', 200),
                    // send names arrays so frontend can render human-readable tags
                    'symptoms' => $p->symptom_names ?? [],
                    'treatment_description' => $p->treatment_description,
                    'priorillnesses' => $p->priorillness_names ?? [],
                    // map doctor.user_name -> name so frontend can use doctor.name
                    'doctor' => $p->doctor ? [
                        'id' => $p->doctor->id,
                        'name' => $p->doctor->user_name ?? $p->doctor->name ?? null,
                    ] : null,
                    'created_at' => $p->created_at?->toDateTimeString(),
                ];
            });

        return Inertia::render('AdminPage/DashboardAdmin', [
            'stats' => [
                'totalPatients' => $totalPatients,
                'totalDoctors' => $totalDoctors,
                'totalDiseases' => $totalDiseases,
            ],
            'weeklyPatientTrend' => $weeklyPatientTrend,
            'diseaseTypes' => $pieData,
            'pendingNotifications' => $pendingNotifications,
        ]);
    }
}
