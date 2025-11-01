import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { router } from "@inertiajs/react";

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = () => {
    let isValid = true;
    
    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (isValid) {
      setIsLoading(true);
      
      router.post('/forgot-password/send-code', {
        email,
      }, {
        onSuccess: () => {
          setStep('otp');
          setIsLoading(false);
        },
        onError: (errors) => {
          setIsLoading(false);
          if (errors.email) {
            setEmailError(errors.email);
          } else {
            setEmailError("Failed to send verification code. Please try again.");
          }
        },
      });
    }
  };

  const handleOtpSubmit = () => {
    let isValid = true;
    
    if (!otp.trim()) {
      setOtpError("Verification code is required");
      isValid = false;
    } else if (otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit code");
      isValid = false;
    } else {
      setOtpError("");
    }

    if (isValid) {
      setIsLoading(true);
      
      router.post('/forgot-password/verify-code', {
        email,
        code: otp,
      }, {
        onSuccess: () => {
          setStep('reset');
          setIsLoading(false);
        },
        onError: (errors) => {
          setIsLoading(false);
          if (errors.code) {
            setOtpError(errors.code);
          } else if (errors.otp) {
            setOtpError(errors.otp);
          } else {
            setOtpError("Invalid verification code. Please try again.");
          }
        },
      });
    }
  };

  const handlePasswordReset = () => {
    let isValid = true;
    
    if (!password.trim()) {
      setPasswordError("New password is required");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Please confirm your new password");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    if (isValid) {
      setIsLoading(true);
      
      router.post('/forgot-password/reset-password', {
        email,
        code: otp,
        password,
        password_confirmation: confirmPassword,
      }, {
        onSuccess: () => {
          setIsLoading(false);
        },
        onError: (errors) => {
          setIsLoading(false);
          if (errors.password) {
            setPasswordError(errors.password);
          }
          if (errors.password_confirmation) {
            setConfirmPasswordError(errors.password_confirmation);
          }
          if (errors.code) {
            setOtpError("Verification code expired. Please request a new code.");
            setStep('email');
          }
        },
      });
    }
  };

  const handleBackToLogin = () => {
    router.visit('/login');
  };

  const handleResendCode = () => {
    setIsLoading(true);
    setOtpError("");
    
    router.post('/forgot-password/resend-code', {
      email,
    }, {
      onSuccess: () => {
        setIsLoading(false);
        setOtp("");
      },
      onError: () => {
        setIsLoading(false);
        setOtpError("Failed to resend code. Please try again.");
      },
    });
  };

  const renderEmailStep = () => (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4 transition-colors">
      <div className="mb-6">
        <img src="/assets/logo.jpg" alt="PiKrus Logo" className="h-16 w-auto object-contain" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-sm p-6 space-y-5 border border-blue-100 dark:border-gray-700 transition-colors">
        <h2 className="text-lg font-semibold text-center text-blue-600 dark:text-blue-300 mb-4 transition-colors">
          Forgot Password
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
          Enter your email address and we'll send you a verification code
        </p>
        <div className="space-y-5">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="bg-blue-50 dark:bg-gray-900 w-full px-4 py-2 border border-blue-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-blue-800 dark:text-gray-200 transition-colors"
              disabled={isLoading}
            />
            {emailError && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">{emailError}</p>
            )}
          </div>
          <button
            onClick={handleEmailSubmit}
            disabled={isLoading}
            className="w-full py-2 bg-blue-600 dark:bg-blue-900 hover:bg-blue-700 dark:hover:bg-blue-950 text-white font-semibold rounded shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending Code..." : "Send Verification Code"}
          </button>
          <div className="text-center">
            <button
              onClick={handleBackToLogin}
              className="text-blue-600 dark:text-blue-300 hover:underline text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
              disabled={isLoading}
            >
              <FaArrowLeft className="w-3 h-3" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOtpStep = () => (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4 transition-colors">
      <div className="mb-6">
        <img src="/assets/logo.jpg" alt="PiKrus Logo" className="h-16 w-auto object-contain" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-sm p-6 space-y-5 border border-blue-100 dark:border-gray-700 transition-colors">
        <h2 className="text-lg font-semibold text-center text-blue-600 dark:text-blue-300 mb-2 transition-colors">
          Enter Verification Code
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center mb-4">
          We've sent a 6-digit verification code to<br />
          <span className="font-medium text-blue-600 dark:text-blue-300">{email}</span>
        </p>
        <div className="space-y-5">
          <div>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="bg-blue-50 dark:bg-gray-900 w-full px-4 py-3 border border-blue-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-blue-800 dark:text-gray-200 text-center tracking-[0.3em] font-mono text-lg transition-colors"
              maxLength={6}
              disabled={isLoading}
            />
            {otpError && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1 text-center">{otpError}</p>
            )}
          </div>
          <button
            onClick={handleOtpSubmit}
            disabled={isLoading || otp.length !== 6}
            className="w-full py-2 bg-blue-600 dark:bg-blue-900 hover:bg-blue-700 dark:hover:bg-blue-950 text-white font-semibold rounded shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </button>
          <div className="text-center">
            <button
              onClick={handleResendCode}
              disabled={isLoading}
              className="text-blue-600 dark:text-blue-300 hover:underline text-xs disabled:opacity-50 transition-colors"
            >
              Didn't receive the code? Resend
            </button>
          </div>
          <div className="text-center">
            <button
              onClick={() => setStep('email')}
              disabled={isLoading}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
            >
              <FaArrowLeft className="w-3 h-3" />
              Change Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResetStep = () => (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4 transition-colors">
      <div className="mb-6">
        <img src="/assets/logo.jpg" alt="PiKrus Logo" className="h-16 w-auto object-contain" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-sm p-6 space-y-5 border border-blue-100 dark:border-gray-700 transition-colors">
        <h2 className="text-lg font-semibold text-center text-blue-600 dark:text-blue-300 mb-4 transition-colors">
          Create New Password
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center mb-4">
          Enter your new password below
        </p>
        <div className="space-y-5">
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password"
                className="bg-blue-50 dark:bg-gray-900 w-full px-4 py-2 border border-blue-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-blue-800 dark:text-gray-200 pr-10 transition-colors"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-blue-600 dark:text-blue-300 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            {passwordError && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">{passwordError}</p>
            )}
          </div>
          <div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                className="bg-blue-50 dark:bg-gray-900 w-full px-4 py-2 border border-blue-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-blue-800 dark:text-gray-200 pr-10 transition-colors"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-blue-600 dark:text-blue-300 transition-colors"
                disabled={isLoading}
              >
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            {confirmPasswordError && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">{confirmPasswordError}</p>
            )}
          </div>
          <button
            onClick={handlePasswordReset}
            disabled={isLoading || !password || !confirmPassword}
            className="w-full py-2 bg-blue-600 dark:bg-blue-900 hover:bg-blue-700 dark:hover:bg-blue-950 text-white font-semibold rounded shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Resetting Password..." : "Reset Password"}
          </button>
        </div>
      </div>
    </div>
  );

  switch (step) {
    case 'email':
      return renderEmailStep();
    case 'otp':
      return renderOtpStep();
    case 'reset':
      return renderResetStep();
    default:
      return renderEmailStep();
  }
};

export default ForgotPassword;