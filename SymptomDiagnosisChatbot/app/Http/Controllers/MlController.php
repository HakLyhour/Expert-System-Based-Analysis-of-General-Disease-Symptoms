<?php
// app/Http/Controllers/MlController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\Process\Process;

class MlController extends Controller
{
    public function retrain(Request $request)
    {
        // Configure paths in your .env:
        // ML_PYTHON="C:\Thesis\symptom_predictor_ml\.venv\Scripts\python.exe"
        // ML_DIR="C:\Thesis\symptom_predictor_ml"
        // (or Linux/Mac equivalents)
        $python  = env('ML_PYTHON', 'python');
        $mlDir   = env('ML_DIR', base_path('../symptom_predictor_ml'));
        $timeout = (int) env('ML_TIMEOUT', 600); // up to 10 min

        // Train from DB (also writes data/features.json)
        $cmd = [$python, 'train_model_db.py'];

        $process = new Process($cmd, $mlDir, null, null, $timeout);
        $process->run();

        if (!$process->isSuccessful()) {
            $err = $process->getErrorOutput() ?: $process->getOutput();
            return back()->with([
                'mlSuccess' => false,
                'mlMessage' => 'Retrain failed',
                'mlLog'     => trim($err),
            ]);
        }

        return back()->with([
            'mlSuccess' => true,
            'mlMessage' => 'Model retrained successfully',
            'mlLog'     => trim($process->getOutput()),
        ]);
    }
}
