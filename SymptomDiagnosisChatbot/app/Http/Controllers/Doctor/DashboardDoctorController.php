<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Disease;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class DashboardDoctorController extends Controller
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

        return Inertia::render('DoctorPage/DashboardDoctor', [
            'stats' => [
                'totalPatients' => $totalPatients,
                'totalDoctors' => $totalDoctors,
                'totalDiseases' => $totalDiseases,
                'patientPercentage' => $patientPercentage,
                'doctorPercentage' => $doctorPercentage,
                'diseasePercentage' => $diseasePercentage,
            ],
            'weeklyPatientTrend' => $weeklyPatientTrend,
            'diseaseTypes' => $pieData,
        ]);
    }
}