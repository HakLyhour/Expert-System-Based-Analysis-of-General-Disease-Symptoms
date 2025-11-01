<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;
use App\Models\User;
use App\Mail\PasswordResetOtpMail;
use App\Mail\PasswordResetSuccessMail;

class Auth0ForgotPasswordController extends Controller
{
    /**
     * Step 1: Send OTP code to user's email
     */
    public function sendCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = $request->email;

        try {
            // Check if user exists in local database
            $user = User::where('email', $email)->first();
            if (!$user) {
                return back()->withErrors(['email' => 'No account found with this email address.']);
            }

            // Rate limiting - prevent abuse
            $attemptKey = 'forgot_password_attempts_' . md5($email);
            $attempts = Cache::get($attemptKey, 0);
            
            if ($attempts >= 5) {
                return back()->withErrors(['email' => 'Too many attempts. Please try again in 1 hour.']);
            }

            // Increment attempts counter
            Cache::put($attemptKey, $attempts + 1, 3600); // 1 hour

            // Generate 6-digit OTP code
            $otpCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            
            // Store OTP in cache with email for verification
            $sessionKey = 'password_reset_otp_' . md5($email);
            Cache::put($sessionKey, [
                'email' => $email,
                'code' => $otpCode,
                'step' => 'code_sent',
                'timestamp' => time()
            ], 600); // 10 minutes expiration

            // Send OTP email
            Mail::to($email)->send(new PasswordResetOtpMail($otpCode, $user->name ?? 'User'));

            Log::info('Password reset OTP sent to: ' . $email);

            return back()->with('success', 'Verification code sent to your email.');

        } catch (\Exception $e) {
            Log::error('Failed to send OTP: ' . $e->getMessage());
            return back()->withErrors(['email' => 'Failed to send verification code. Please try again.']);
        }
    }

    /**
     * Step 2: Verify the OTP code
     */
    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $email = $request->email;
        $code = $request->code;

        try {
            // Get OTP session from cache
            $sessionKey = 'password_reset_otp_' . md5($email);
            $session = Cache::get($sessionKey);

            // Check if session exists
            if (!$session || $session['email'] !== $email) {
                return back()->withErrors(['code' => 'Session expired. Please request a new code.']);
            }

            // Verify the OTP code
            if ($session['code'] !== $code) {
                return back()->withErrors(['code' => 'Invalid verification code. Please try again.']);
            }

            // Check if code expired (10 minutes)
            if (time() - $session['timestamp'] > 600) {
                Cache::forget($sessionKey);
                return back()->withErrors(['code' => 'Code expired. Please request a new one.']);
            }

            // Mark code as verified
            $session['step'] = 'code_verified';
            $session['verified_at'] = time();
            Cache::put($sessionKey, $session, 600); // Extend for another 10 minutes

            Log::info('OTP verified successfully for: ' . $email);

            return back()->with('success', 'Code verified successfully.');

        } catch (\Exception $e) {
            Log::error('Code verification failed: ' . $e->getMessage());
            return back()->withErrors(['code' => 'Verification failed. Please try again.']);
        }
    }

    /**
     * Step 3: Reset password in Laravel database and send confirmation email
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $email = $request->email;

        try {
            // Check session and verify code was validated
            $sessionKey = 'password_reset_otp_' . md5($email);
            $session = Cache::get($sessionKey);

            if (!$session || $session['step'] !== 'code_verified' || $session['email'] !== $email) {
                return back()->withErrors(['password' => 'Session expired or code not verified. Please start over.']);
            }

            // Check if verification is still valid (10 minutes from verification)
            if (time() - $session['verified_at'] > 600) {
                Cache::forget($sessionKey);
                return back()->withErrors(['password' => 'Verification expired. Please start over.']);
            }

            // Find user in local database
            $user = User::where('email', $email)->first();
            if (!$user) {
                return back()->withErrors(['password' => 'User not found.']);
            }

            // Update password in Laravel database ONLY
            $user->update([
                'password' => Hash::make($request->password)
            ]);

            // Send success confirmation email
            Mail::to($email)->send(new PasswordResetSuccessMail($user->name ?? 'User'));

            // Clear all password reset caches
            Cache::forget($sessionKey);
            Cache::forget('forgot_password_attempts_' . md5($email));
            Cache::forget('password_reset_resend_' . md5($email));

            // Log successful password reset
            Log::info('Password reset successful for user: ' . $email);

            session()->flash('success', 'Password reset successfully! You can now login with your new password.');
            return redirect()->route('login');

        } catch (\Exception $e) {
            Log::error('Password reset failed: ' . $e->getMessage());
            return back()->withErrors(['password' => 'Failed to reset password. Please try again.']);
        }
    }

    /**
     * Resend OTP code
     */
    public function resendCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        // Check resend rate limiting
        $resendKey = 'password_reset_resend_' . md5($request->email);
        $resendCount = Cache::get($resendKey, 0);
        
        if ($resendCount >= 3) {
            return back()->withErrors(['email' => 'Too many resend attempts. Please wait 1 hour before trying again.']);
        }

        // Increment resend counter
        Cache::put($resendKey, $resendCount + 1, 3600); // 1 hour

        // Clear old session and send new code
        $sessionKey = 'password_reset_otp_' . md5($request->email);
        Cache::forget($sessionKey);

        // Send new code
        return $this->sendCode($request);
    }
}