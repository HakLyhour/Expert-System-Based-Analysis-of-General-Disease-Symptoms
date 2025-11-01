import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { router, usePage } from "@inertiajs/react";
import { SharedData } from "@/types";


const LoginPage: React.FC = () => {

  const page = usePage<SharedData>();
  const user = page.props.auth?.user;

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleLogin = () => {
    let isValid = true;

    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (isValid) {
      router.post('/login', {   // send POST request to login
        email,
        password,
        remember: rememberMe ? "on" : "",
      }, {
        onError: (errors) => {
          // Show errors from Laravel if login fails
          if (errors.email) setEmailError(errors.email);
          else setEmailError("");

          if (errors.password) setPasswordError(errors.password);
          else setPasswordError("");
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4 transition-colors">
      {/* Centered Logo */}
      <div className="mb-6">
        <img
          src="/assets/logo.jpg"
          alt="Logo"
          className="h-16 w-auto object-contain"
        />
      </div>

      {/* Login Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-sm p-6 space-y-5 border border-blue-100 dark:border-gray-700 transition-colors">
        <h2 className="text-lg font-semibold text-center text-blue-600 dark:text-blue-300 mb-4 transition-colors">
          Login
        </h2>

        {/* Email Input */}
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="bg-blue-50 dark:bg-gray-900 w-full px-4 py-2 border border-blue-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-blue-800 dark:text-gray-200 transition-colors"
          />
          {emailError && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-1">{emailError}</p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="bg-blue-50 dark:bg-gray-900 w-full px-4 py-2 border border-blue-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-blue-800 dark:text-gray-200 pr-10 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-blue-600 dark:text-blue-300 transition-colors"
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          {passwordError && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-1">{passwordError}</p>
          )}

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between mt-2 text-sm">
            <label className="flex items-center gap-2 text-blue-800 dark:text-gray-200">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-blue-600 dark:accent-blue-400"
              />
              Remember me
            </label>
            <a
              href="/forgot-password"
              className="text-blue-600 dark:text-blue-300 hover:underline"
            >
              Forgot password?
            </a>
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full py-2 bg-blue-600 dark:bg-blue-900 hover:bg-blue-700 dark:hover:bg-blue-950 text-white font-semibold rounded shadow transition-colors"
        >
          Log In
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
