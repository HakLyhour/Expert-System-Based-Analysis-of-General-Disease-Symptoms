import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const GENDER_OPTIONS = [
  { value: "", label: "Select Gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const SignUpPage: React.FC = () => {
  const [form, setForm] = useState({
    user_name: "",
    date_of_birth: "",
    gender: "",
    height: "",
    weight: "",
    email: "",
    password: "",
    password_confirmation: "",
    agree: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showAgreementError, setShowAgreementError] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(null);
    setShowAgreementError(false);

    if (!form.agree) {
      setShowAgreementError(true);
      return;
    }

    if (form.password !== form.password_confirmation) {
      setErrors(prev => ({
        ...prev,
        password_confirmation: "Passwords do not match"
      }));
      return;
    }

    setLoading(true);
    const { agree, ...postData } = form; // Don't send `agree` to backend

    router.post("/register", postData, {
      onError: (errors) => {
        setErrors(errors);
        setLoading(false);
      },
      onSuccess: () => {
        setSuccess("Account created! Please log in.");
        setLoading(false);
        setForm({
          user_name: "",
          date_of_birth: "",
          gender: "",
          height: "",
          weight: "",
          email: "",
          password: "",
          password_confirmation: "",
          agree: false,
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4 py-8 transition-colors">
      <div className="mb-6">
        <img src="/assets/logo.jpg" alt="Logo" className="h-16 w-auto object-contain" />
      </div>

      <h1 className="text-xl font-bold text-blue-600 dark:text-blue-300 mb-5">Let’s Get You Started</h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg p-6 space-y-3 shadow border border-blue-100 dark:border-gray-700"
      >
        <h2 className="text-lg font-bold text-blue-600 dark:text-blue-300 mb-2">Create New Account</h2>

        <div>
          <label htmlFor="user_name" className="text-sm text-blue-700 dark:text-blue-300 mb-1 block">
            Full Name
          </label>
          <input
            type="text"
            name="user_name"
            id="user_name"
            placeholder="Full Name"
            value={form.user_name}
            onChange={handleChange}
            className="bg-blue-50 dark:bg-gray-900 px-3 py-2 rounded border border-blue-200 dark:border-gray-700 text-sm w-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none text-blue-800 dark:text-gray-200"
          />
          {errors.user_name && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.user_name}</p>
          )}
        </div>

        <div>
          <label htmlFor="date_of_birth" className="text-sm text-blue-700 dark:text-blue-300 mb-1 block">
            Date of Birth
          </label>
          <input
            type="date"
            name="date_of_birth"
            id="date_of_birth"
            placeholder="Date of Birth"
            value={form.date_of_birth}
            onChange={handleChange}
            className="bg-blue-50 dark:bg-gray-900 px-3 py-2 rounded border border-blue-200 dark:border-gray-700 text-sm w-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none text-blue-800 dark:text-gray-200"
          />
          {errors.date_of_birth && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.date_of_birth}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="gender" className="text-sm text-blue-700 dark:text-blue-300 mb-1 block">
              Gender
            </label>
            <select
              name="gender"
              id="gender"
              value={form.gender}
              onChange={handleChange}
              required
              className="bg-blue-50 dark:bg-gray-900 px-3 py-2 rounded border border-blue-200 dark:border-gray-700 text-sm w-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none text-blue-800 dark:text-gray-200"
            >
              {GENDER_OPTIONS.map(opt => (
                <option value={opt.value} key={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.gender && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.gender}</p>
            )}
          </div>
          <div>
            <label htmlFor="height" className="text-sm text-blue-700 dark:text-blue-300 mb-1 block">
              Height (cm)
            </label>
            <input
              type="text"
              name="height"
              id="height"
              placeholder="Height (cm)"
              value={form.height}
              onChange={handleChange}
              className="bg-blue-50 dark:bg-gray-900 px-3 py-2 rounded border border-blue-200 dark:border-gray-700 text-sm w-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none text-blue-800 dark:text-gray-200"
            />
            {errors.height && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.height}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="weight" className="text-sm text-blue-700 dark:text-blue-300 mb-1 block">
            Weight (kg)
          </label>
          <input
            type="text"
            name="weight"
            id="weight"
            placeholder="Weight (kg)"
            value={form.weight}
            onChange={handleChange}
            className="bg-blue-50 dark:bg-gray-900 px-3 py-2 rounded border border-blue-200 dark:border-gray-700 text-sm w-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none text-blue-800 dark:text-gray-200"
          />
          {errors.weight && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.weight}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="text-sm text-blue-700 dark:text-blue-300 mb-1 block">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="bg-blue-50 dark:bg-gray-900 px-3 py-2 rounded border border-blue-200 dark:border-gray-700 text-sm w-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none text-blue-800 dark:text-gray-200"
          />
          {errors.email && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div className="relative">
          <label htmlFor="password" className="text-sm text-blue-700 dark:text-blue-300 mb-1 block">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            id="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="bg-blue-50 dark:bg-gray-900 px-3 py-2 pr-10 rounded border border-blue-200 dark:border-gray-700 text-sm w-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none text-blue-800 dark:text-gray-200"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-8 text-blue-600 dark:text-blue-300"
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </button>
          <p className="text-xs text-blue-600 dark:text-blue-300 pt-1">
            Must be 8+ characters with number, symbol, upper and lower case.
          </p>
          {errors.password && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <div className="relative">
          <label htmlFor="password_confirmation" className="text-sm text-blue-700 dark:text-blue-300 mb-1 block">
            Confirm Password
          </label>
          <input
            type={showConfirm ? "text" : "password"}
            name="password_confirmation"
            id="password_confirmation"
            placeholder="Confirm Password"
            value={form.password_confirmation}
            onChange={handleChange}
            className="bg-blue-50 dark:bg-gray-900 px-3 py-2 pr-10 rounded border border-blue-200 dark:border-gray-700 text-sm w-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none text-blue-800 dark:text-gray-200"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-8 text-blue-600 dark:text-blue-300"
          >
            {showConfirm ? <FaEye /> : <FaEyeSlash />}
          </button>
          {errors.password_confirmation && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.password_confirmation}</p>
          )}
        </div>

        <label className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
          <input
            type="checkbox"
            name="agree"
            checked={form.agree}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-400 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          I agree to the{" "}
          <span className="text-blue-600 dark:text-blue-300 underline cursor-pointer">
            terms and services
          </span>
        </label>
        {showAgreementError && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-1">
            You need to agree with Terms and Services
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 dark:bg-blue-900 hover:bg-blue-700 dark:hover:bg-blue-950 text-white py-2 rounded text-sm font-semibold"
          disabled={loading}
        >
          {loading ? "Registering..." : "Sign Up"}
        </button>
        {success && (
          <div className="text-green-600 dark:text-green-400 text-center text-sm pt-2">{success}</div>
        )}
      </form>
    </div>
  );
};

export default SignUpPage;
