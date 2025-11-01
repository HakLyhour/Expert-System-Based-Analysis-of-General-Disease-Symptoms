<?php
// Test script to exactly mimic what the Laravel application does

require __DIR__ . '/vendor/autoload.php';

use Symfony\Component\Process\Process;

// Bootstrap the Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Get configuration values using Laravel's config helper
$python = config('services.ml.python');
$cwd = config('services.ml.dir');
$timeout = config('services.ml.timeout');

// Create payload
$payload = json_encode([
    'symptoms' => [],
    'prior_illnesses' => ['None'],
], JSON_UNESCAPED_UNICODE);

echo "Python executable: $python\n";
echo "Working directory: $cwd\n";
echo "Timeout: $timeout\n";
echo "Payload: $payload\n";

$cmd = [$python, 'cli_predict.py'];

// Explicitly pass current environment to the process
$env = $_ENV;
if (empty($env)) {
    $env = getenv();
}

echo "Command: " . implode(' ', $cmd) . "\n";

$p = new Process($cmd, $cwd, $env, $payload, $timeout);
$p->run();

echo "Exit Code: " . $p->getExitCode() . "\n";
echo "Error Output: " . $p->getErrorOutput() . "\n";
echo "Stdout: " . $p->getOutput() . "\n";

if (!$p->isSuccessful()) {
    echo "Process failed!\n";
    
    // Log error and environment for debugging
    $logFile = storage_path('logs/ml_process_debug.log');
    $logMsg = "==== ML Process Error ====\n";
    $logMsg .= "Date: " . date('c') . "\n";
    $logMsg .= "Command: " . implode(' ', $cmd) . "\n";
    $logMsg .= "CWD: $cwd\n";
    $logMsg .= "Env: " . print_r($env, true) . "\n";
    $logMsg .= "Payload: $payload\n";
    $logMsg .= "Exit Code: " . $p->getExitCode() . "\n";
    $logMsg .= "Error Output: " . $p->getErrorOutput() . "\n";
    $logMsg .= "Stdout: " . $p->getOutput() . "\n";
    $logMsg .= "=========================\n";
    @file_put_contents($logFile, $logMsg, FILE_APPEND);
} else {
    echo "Process succeeded!\n";
}