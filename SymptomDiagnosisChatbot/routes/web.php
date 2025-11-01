<?php

use Illuminate\Support\Facades\DB;

use App\Http\Controllers\Auth\RegisteredDoctorController;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DiseaseController;
use App\Http\Controllers\Admin\SymptomController;
use App\Http\Controllers\Admin\KnowledgebaseController;
use App\Http\Controllers\Admin\PriorillnessController;
use App\Http\Controllers\Api\DiagnosisController;
use App\Http\Controllers\Doctor\DashboardDoctorController;
use App\Http\Controllers\MlController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\PatientSettingController;
use App\Http\Controllers\Auth\Auth0ForgotPasswordController;
use App\Http\Controllers\PendingKnowledgebaseController;


/* Route::post('/admin/ml/retrain', [MlController::class, 'retrain'])
    ->name('admin.ml.retrain'); */

// Public routes

Route::get('/', function () {
    return Inertia::render('Home', [
        'canLogin'      => Route::has('login'),
        'canRegister'   => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'    => PHP_VERSION,
    ]);
})->name('home');



// Health Roadmap page: show diseases, symptoms, treatments from DB
use App\Models\Knowledgebase;

Route::get('/health-roadmap', function () {
    $kbList = Knowledgebase::with(['disease', 'symptoms', 'treatments'])->get();

    $diseases = $kbList->map(function ($kb) {
        return [
            'name'            => $kb->disease?->diseases_name ?? '',
            'description'     => $kb->disease?->description ?? '',
            'confidenceScore' => rand(80, 100), // Placeholder, adjust as needed
            'symptoms'        => $kb->symptoms->pluck('name')->toArray(),
            'treatment'       => $kb->treatments->pluck('description')->implode(', '),
        ];
    })->filter(fn($d) => $d['name'] !== '')->values();

    return Inertia::render('WelcomePage/HealthRoadmap', [
        'diseases' => $diseases,
    ]);
})->name('healthroadmap');

Route::post('/retrain-model', function () {
    $pythonPath = config('services.ml.python');
    $scriptPath = 'C:/Thesis/symptom_predictor_ml/train_model_db.py';

    // Run the Python script
    $output = shell_exec("\"$pythonPath\" \"$scriptPath\" 2>&1");

    // Determine success (very basic: if output contains 'error' or 'Exception', treat as failure)
    $success = true;
    if ($output === null || stripos($output, 'error') !== false || stripos($output, 'exception') !== false) {
        $success = false;
    }

    // Set flash keys expected by frontend
    return back()
        ->with([
            'mlSuccess' => $success,
            'mlMessage' => $success ? 'Model retrained successfully!' : 'Model retraining failed. See log for details.',
            'mlLog'     => $output,
        ]);
})->name('retrain.model');


// If you want to enable About/Privacy/AboutUs, uncomment and point to your React pages
/*
Route::get('/about', fn() => Inertia::render('AboutAI/AboutAIPage'))->name('about');
Route::get('/privacy', fn() => Inertia::render('PrivacyPage/PrivacyPage'))->name('privacy');
Route::get('/aboutus', fn() => Inertia::render('AboutUs/AboutUsPage'))->name('aboutus');
*/

// Auth routes (from Breeze)
require __DIR__ . '/auth.php';

// Profile routes (standard user profile edit/update/delete)
/* Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
}); */

// Settings routes (for profile and password update, using ProfileController)

Route::middleware('auth')->group(function () {
    Route::post('/settings/profile', [ProfileController::class, 'update'])->name('settings.profile.update');

    // Password update route
    Route::post('/settings/password', [ProfileController::class, 'updatePassword'])->name('settings.password.update');

    // show patient settings + history
    Route::get('/settings/profile', [PatientSettingController::class, 'index'])->name('settings.history.index');

    // Knowledgebase request route
    Route::post('/pending-knowledgebases', [PendingKnowledgebaseController::class, 'store'])->name('pending.store');
});

// Redirect user by role after login
Route::middleware('auth')->get('/redirect-by-role', function () {
    $role = Auth::user()?->role;
    return match ($role) {
        'admin'  => redirect('/dashboard'),
        'doctor' => redirect('/dashboarddoctor'),
        default  => redirect('/'),
    };
})->name('redirect.by.role');



//    ROLE-BASED ROUTES
// Public routes
// Welcome page: show last 20 logs
Route::get('/welcome', function () {
    $recentLogs = DB::table('diagnosis as d')
        ->join('diseases as dis', 'dis.id', '=', 'd.disease_id')
        ->orderByDesc('d.created_at')
        ->limit(20)
        ->get(['d.id as diagnosis_id', 'dis.diseases_name as disease', 'd.created_at'])
        ->map(fn($row) => [
            'id'            => $row->diagnosis_id,
            'label'         => $row->disease ?? 'Unknown',
            'date'          => $row->created_at ? \Carbon\Carbon::parse($row->created_at)->format('Y-m-d H:i') : null,
            'step'          => 1,
            'is_final_step' => true,
            'diagnosis_id'  => $row->diagnosis_id,
        ])
        ->toArray();

    return Inertia::render('WelcomePage/WelcomePage', [
        'recentLogs' => $recentLogs,
    ]);
})->name('welcome');

// Symptom form
Route::get('/symptom-form', function () {
    return Inertia::render('WelcomePage/SymptomPage', [
        'symptoms'       => \App\Models\Symptom::pluck('name')->toArray(),
        'priorIllnesses' => \App\Models\Priorillness::pluck('priorillness_name')->toArray(),
    ]);
})->name('symptom.form');

// Store diagnosis
Route::post('/diagnose', [DiagnosisController::class, 'store'])->name('diagnose.store');

// View results directly after store
// (Better: redirect to /diagnosis/{id} instead of using a /results with no ID)
Route::get('/diagnosis/{id}', [DiagnosisController::class, 'show'])->name('diagnosis.show');







Route::get('/how-to-use', fn() => Inertia::render('how-to-use/how-to-use'))->name('how.to.use');
Route::get('/terms-policy', fn() => Inertia::render('TermsPolicyPage/TermsPolicyPage'))->name('terms.policy');

// Admin-only routes
Route::middleware(['auth', RoleMiddleware::class . ':admin'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/listdoctor', [RegisteredDoctorController::class, 'index'])->name('listdoctor.index');
    Route::post('/listdoctor', [RegisteredDoctorController::class, 'store'])->name('listdoctor.store');
    Route::post('/listdoctor/{id}', [RegisteredDoctorController::class, 'update'])->name('listdoctor.update');
    Route::put('/listdoctor/{id}', [RegisteredDoctorController::class, 'update'])->name('listdoctor.update.put');

    // Knowledgebase approval routes
    Route::get('/pending-knowledgebases', [PendingKnowledgebaseController::class, 'index'])->name('admin.pending');
    Route::post('/pending-knowledgebases/{id}/approve', [PendingKnowledgebaseController::class, 'approve'])->name('admin.pending.approve');
    Route::delete('/pending-knowledgebases/{id}', [PendingKnowledgebaseController::class, 'reject'])->name('admin.pending.reject');
    
    // Fixed: use 'edit' method so React page receives user info!
    //Route::get('/settingadmin', [ProfileController::class, 'edit'])->name('settingadmin');

});

// Doctor-only routes
Route::middleware(['auth', RoleMiddleware::class . ':doctor'])->group(function () {
    Route::get('/dashboarddoctor', [DashboardDoctorController::class, 'index'])->name('doctor.dashboard');
    Route::get('/settingadmin', [ProfileController::class, 'index'])->name('settingadmin');
});

// Admin & Doctor shared routes
Route::middleware(['auth', RoleMiddleware::class . ':admin,doctor'])->group(function () {
    Route::post('/diseases', [DiseaseController::class, 'store']);
    Route::post('/symptoms', [SymptomController::class, 'store']);
    Route::post('/priorillnesses', [PriorillnessController::class, 'store'])->name('priorillnesses.store');
    Route::get('/settingadmin', [ProfileController::class, 'index'])->name('settingadmin');
   
    // Knowledgebase routes
    Route::get('/knowledgebases', [KnowledgebaseController::class, 'index'])->name('knowledgebases.index');
    Route::post('/knowledgebases', [KnowledgebaseController::class, 'store'])->name('knowledgebases.store');
    Route::put('/knowledgebases/{id}', [KnowledgebaseController::class, 'update'])->name('knowledgebases.update');
    
    // edit symptom route
    Route::get('/editsymptom', [SymptomController::class, 'index'])->name('editsymptom.index');
    Route::post('/editsymptom/{id}', [SymptomController::class, 'update'])->name('editsymptom.update');
    Route::put('/editsymptom/{id}', [SymptomController::class, 'update'])->name('editsymptom.update.put');
    
    // Edit Prior Illness route
    Route::get('/editpriorillnesses', [PriorIllnessController::class, 'index'])->name('priorillness.index');
    Route::post('/editpriorillnesses/{id}', [PriorIllnessController::class, 'update'])->name('priorillness.update');
    Route::put('/editpriorillnesses/{id}', [PriorIllnessController::class, 'update'])->name('priorillness.update.put');
});


Route::prefix('forgot-password')->name('forgot-password.')->group(function () {
    Route::post('/send-code', [Auth0ForgotPasswordController::class, 'sendCode'])->name('send-code');
    Route::post('/verify-code', [Auth0ForgotPasswordController::class, 'verifyCode'])->name('verify-code');
    Route::post('/reset-password', [Auth0ForgotPasswordController::class, 'resetPassword'])->name('reset-password');
    Route::post('/resend-code', [Auth0ForgotPasswordController::class, 'resendCode'])->name('resend-code');
});

Route::get('/forgot-password', function () {
    return inertia('Auth/ForgotPassword');
})->name('forgot-password');

// // Forgot Password Routes
// Route::prefix('forgot-password')->name('forgot-password.')->group(function () {
//     Route::post('/send-code', [PasswordResetLinkController::class, 'sendCode'])->name('send-code');
//     Route::post('/verify-code', [PasswordResetLinkController::class, 'verifyCode'])->name('verify-code');
//     Route::post('/reset-password', [PasswordResetLinkController::class, 'resetPassword'])->name('reset-password');
//     Route::post('/resend-code', [PasswordResetLinkController::class, 'resendCode'])->name('resend-code');
// });

// // Show forgot password page
// Route::get('/forgot-password', function () {
//     return inertia('Auth/ForgotPassword');
// })->name('forgot-password');

// Symptom form page route for dynamic prior illnesses
