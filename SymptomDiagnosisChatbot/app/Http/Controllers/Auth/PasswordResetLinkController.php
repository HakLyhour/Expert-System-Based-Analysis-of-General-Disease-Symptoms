<?php

// namespace App\Http\Controllers\Auth;

// use App\Http\Controllers\Controller;
// use Illuminate\Http\RedirectResponse;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Password;
// use Illuminate\Validation\ValidationException;
// use Inertia\Inertia;
// use Inertia\Response;

// class PasswordResetLinkController extends Controller
// {
//     /**
//      * Display the password reset link request view.
//      */
//     public function create(): Response
//     {
//         return Inertia::render('Auth/ForgotPassword', [
//             'status' => session('status'),
//         ]);
//     }

//     /**
//      * Handle an incoming password reset link request.
//      *
//      * @throws \Illuminate\Validation\ValidationException
//      */
//     public function store(Request $request): RedirectResponse
//     {
//         $request->validate([
//             'email' => 'required|email',
//         ]);

//         // We will send the password reset link to this user. Once we have attempted
//         // to send the link, we will examine the response then see the message we
//         // need to show to the user. Finally, we'll send out a proper response.
//         $status = Password::sendResetLink(
//             $request->only('email')
//         );

//         if ($status == Password::RESET_LINK_SENT) {
//             return back()->with('status', __($status));
//         }

//         throw ValidationException::withMessages([
//             'email' => [trans($status)],
//         ]);
//     }
// }



namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;
use App\Models\User;
use App\Mail\OtpMail;
use Okta\ClientBuilder;
use Okta\Users\UserBuilder;

class PasswordResetLinkController extends Controller
{
    private $oktaClient;

    public function __construct()
    {
        // Initialize Okta client
        $this->oktaClient = (new ClientBuilder())
            ->setOrganizationUrl("https://" . env('OKTA_DOMAIN'))
            ->setToken(env('OKTA_API_TOKEN'))
            ->build();
    }

    /**
     * Send OTP to user's email via Okta
     */
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = $request->email;

        try {
            // Check if user exists in your local database
            $user = User::where('email', $email)->first();
            if (!$user) {
                return response()->json([
                    'message' => 'User not found'
                ], 404)->withErrors(['email' => 'No account found with this email address.']);
            }

            // Generate 6-digit OTP
            $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            
            // Store OTP in cache for 10 minutes
            $cacheKey = 'forgot_password_otp_' . md5($email);
            Cache::put($cacheKey, $otp, 600); // 10 minutes
            
            // Store attempt count to prevent abuse
            $attemptKey = 'forgot_password_attempts_' . md5($email);
            $attempts = Cache::get($attemptKey, 0) + 1;
            Cache::put($attemptKey, $attempts, 3600); // 1 hour
            
            if ($attempts > 5) {
                return response()->json([
                    'message' => 'Too many attempts'
                ], 429)->withErrors(['email' => 'Too many OTP requests. Please try again later.']);
            }

            // Option 1: Use Okta's built-in password recovery (recommended)
            $this->sendOktaPasswordRecovery($email);
            
            // Option 2: Send custom OTP email (if you want more control)
            // $this->sendCustomOtpEmail($email, $otp);

            return response()->json([
                'message' => 'OTP sent successfully',
                'expires_in' => 600 // 10 minutes
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send OTP: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to send OTP'
            ], 500)->withErrors(['email' => 'Failed to send OTP. Please try again.']);
        }
    }

    /**
     * Use Okta's built-in forgot password flow
     */
    private function sendOktaPasswordRecovery($email)
    {
        try {
            // Find user in Okta
            $users = $this->oktaClient->listUsers(['q' => $email]);
            $oktaUser = null;
            
            foreach ($users as $user) {
                if ($user->getProfile()->getEmail() === $email) {
                    $oktaUser = $user;
                    break;
                }
            }

            if (!$oktaUser) {
                throw new \Exception('User not found in Okta');
            }

            // Trigger Okta's forgot password flow
            $oktaUser->forgotPassword();
            
            return true;

        } catch (\Exception $e) {
            Log::error('Okta password recovery failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Send custom OTP email (alternative approach)
     */
    private function sendCustomOtpEmail($email, $otp)
    {
        try {
            Mail::to($email)->send(new OtpMail($otp));
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send OTP email: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Verify OTP
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        $email = $request->email;
        $otp = $request->otp;
        $cacheKey = 'forgot_password_otp_' . md5($email);

        try {
            $storedOtp = Cache::get($cacheKey);
            
            if (!$storedOtp) {
                return response()->json([
                    'message' => 'OTP expired'
                ], 400)->withErrors(['otp' => 'OTP has expired. Please request a new one.']);
            }

            if ($storedOtp !== $otp) {
                return response()->json([
                    'message' => 'Invalid OTP'
                ], 400)->withErrors(['otp' => 'Invalid OTP. Please check and try again.']);
            }

            // OTP is valid, mark it as verified
            $verifiedKey = 'forgot_password_verified_' . md5($email);
            Cache::put($verifiedKey, true, 600); // 10 minutes to complete password reset
            
            // Remove the OTP from cache
            Cache::forget($cacheKey);

            return response()->json([
                'message' => 'OTP verified successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('OTP verification failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Verification failed'
            ], 500)->withErrors(['otp' => 'Verification failed. Please try again.']);
        }
    }

    /**
     * Resend OTP
     */
    public function resendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        // Check resend attempts
        $resendKey = 'forgot_password_resend_' . md5($request->email);
        $resendAttempts = Cache::get($resendKey, 0);
        
        if ($resendAttempts >= 3) {
            return response()->json([
                'message' => 'Too many resend attempts'
            ], 429)->withErrors(['email' => 'Too many resend attempts. Please wait before trying again.']);
        }

        // Increment resend attempts
        Cache::put($resendKey, $resendAttempts + 1, 3600); // 1 hour

        // Resend OTP
        return $this->sendOtp($request);
    }

    /**
     * Reset password after OTP verification
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $email = $request->email;
        $verifiedKey = 'forgot_password_verified_' . md5($email);

        try {
            // Check if OTP was verified
            if (!Cache::get($verifiedKey)) {
                return response()->json([
                    'message' => 'OTP not verified'
                ], 400)->withErrors(['password' => 'Please verify OTP first.']);
            }

            // Update password in local database
            $user = User::where('email', $email)->first();
            if (!$user) {
                return response()->json([
                    'message' => 'User not found'
                ], 404)->withErrors(['email' => 'User not found.']);
            }

            $user->update([
                'password' => Hash::make($request->password)
            ]);

            // Update password in Okta
            $this->updateOktaPassword($email, $request->password);

            // Clear verification cache
            Cache::forget($verifiedKey);
            Cache::forget('forgot_password_attempts_' . md5($email));
            Cache::forget('forgot_password_resend_' . md5($email));

            return response()->json([
                'message' => 'Password reset successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Password reset failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Password reset failed'
            ], 500)->withErrors(['password' => 'Failed to reset password. Please try again.']);
        }
    }

    /**
     * Update password in Okta
     */
    private function updateOktaPassword($email, $newPassword)
    {
        try {
            // Find user in Okta
            $users = $this->oktaClient->listUsers(['q' => $email]);
            $oktaUser = null;
            
            foreach ($users as $user) {
                if ($user->getProfile()->getEmail() === $email) {
                    $oktaUser = $user;
                    break;
                }
            }

            if (!$oktaUser) {
                throw new \Exception('User not found in Okta');
            }

            // Update password in Okta
            $oktaUser->changePassword($newPassword);
            
            return true;

        } catch (\Exception $e) {
            Log::error('Failed to update Okta password: ' . $e->getMessage());
            // Don't throw here - local password is already updated
            return false;
        }
    }
}
