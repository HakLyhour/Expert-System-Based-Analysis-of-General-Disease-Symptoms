<?php
// Test script to exactly mimic what the Laravel application does

require __DIR__ . '/vendor/autoload.php';

use Symfony\Component\Process\Process;

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Get configuration values
$python = $_ENV['ML_PYTHON'] ?? 'python';
$cwd = $_ENV['ML_DIR'] ?? __DIR__ . '/../symptom_predictor_ml';
$timeout = $_ENV['ML_TIMEOUT'] ?? 10;

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
} else {
    echo "Process succeeded!\n";
}