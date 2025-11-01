<?php

namespace App\Services;

use Symfony\Component\Process\Process;

class PythonMl
{
    private static function mlBasePath(): string
    {
        return 'C:/Thesis/symptom_predictor_ml';
    }

    private static function parseOutput(string $output): array
    {
        $output = trim($output);

        // Clean up bad UTF-8 chars
        $output = mb_convert_encoding($output, 'UTF-8', 'UTF-8');

        $out = json_decode($output, true, 512, JSON_INVALID_UTF8_SUBSTITUTE);

        if (!is_array($out)) {
            throw new \RuntimeException('Invalid JSON from Python: ' . $output);
        }
        if (!empty($out['error'])) {
            throw new \RuntimeException('ML error: ' . $out['error']);
        }

        return $out;
    }


    private static function logError(string $title, array $cmd, string $cwd, Process $p): void
    {
        $logFile = storage_path('logs/ml_process_debug.log');
        $logMsg  = "==== $title ====\n";
        $logMsg .= "Date: " . date('c') . "\n";
        $logMsg .= "Command: " . implode(' ', $cmd) . "\n";
        $logMsg .= "CWD: $cwd\n";
        $logMsg .= "Exit Code: " . $p->getExitCode() . "\n";
        $logMsg .= "Error Output: " . $p->getErrorOutput() . "\n";
        $logMsg .= "Stdout: " . $p->getOutput() . "\n";
        $logMsg .= "=========================\n\n";
        file_put_contents($logFile, $logMsg, FILE_APPEND);
    }

    public static function run(array $symptoms, array $priorIllnesses = []): array
    {
        $python = env('PYTHON_PATH', self::mlBasePath() . '/.venv/Scripts/python.exe');
        $script = self::mlBasePath() . '/cli_predict_fixed.py';
        $cwd    = self::mlBasePath();

        $input = json_encode([
            'symptoms'        => $symptoms,
            'prior_illnesses' => $priorIllnesses,
        ], JSON_UNESCAPED_UNICODE);

        // ✅ Build a clean environment (full, no merge)
        $systemRoot = getenv('SystemRoot') ?: 'C:\Windows';
        $cleanPath  = implode(';', [
            self::mlBasePath() . '\.venv\Scripts',
            $systemRoot . '\System32',
            $systemRoot,
        ]);

        $env = [
            'SystemRoot'     => $systemRoot,
            'windir'         => $systemRoot,
            'PATH'           => $cleanPath,
            'VIRTUAL_ENV'    => self::mlBasePath() . '/.venv',
            'PYTHONHOME'     => null,
            'PYTHONPATH'     => null,
            'PYTHONHASHSEED' => '1',
        ];

        $process = new Process([$python, $script], $cwd, $env, $input, 60);
        $process->run();

        // ✅ NOTE: Always log both STDOUT and STDERR
        $logFile = storage_path('logs/ml_process_debug.log');
        $logMsg  = "==== ML Process Run ====\n";
        $logMsg .= "Date: " . date('c') . "\n";
        $logMsg .= "Command: " . implode(' ', [$python, $script]) . "\n";
        $logMsg .= "CWD: " . self::mlBasePath() . "\n";
        $logMsg .= "Exit Code: " . $process->getExitCode() . "\n";
        $logMsg .= "STDOUT:\n" . $process->getOutput() . "\n";
        $logMsg .= "STDERR:\n" . $process->getErrorOutput() . "\n";
        $logMsg .= "=========================\n\n";
        file_put_contents($logFile, $logMsg, FILE_APPEND);

        if (!$process->isSuccessful()) {
            self::logError("ML Process Error (stdin)", [$python, $script], $cwd, $process);
            throw new \RuntimeException('Python failed: ' . $process->getErrorOutput());
        }

        return self::parseOutput($process->getOutput());
    }

    public static function predict(array $symptoms, array $priorIllnesses = []): array
    {
        return self::run($symptoms, $priorIllnesses);
    }
}
