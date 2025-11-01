import React, { useEffect, useState } from "react";
import { usePage, router, Link } from "@inertiajs/react";
import { BiUndo } from "react-icons/bi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { RefreshCw } from "lucide-react";

type User = {
  user_name: string;
  email: string;
  date_of_birth?: string;
  weight?: string;
  height?: string;
  image?: string;
};

type RecentLog = {
  id: number;
  diagnosis_id: number;
  step: number;
  is_final_step: boolean;
  label: string;
  date: string | null;
};

type PageProps = {
  user: User;
  recentLogs?: RecentLog[] | null;
};

const DEFAULT_IMAGE = "/assets/User.png";
const getImageUrl = (image?: string) => {
  if (!image) return DEFAULT_IMAGE;
  if (image.startsWith("users/")) return `/storage/${image}`;
  return `/assets/${image.replace(/^\/+/, "")}`;
};

const SettingPatientPage: React.FC = () => {
  const { props } = usePage<PageProps>();
  const user = props.user || {};

  // Tab state: "account" | "security" | "history"
  const [tab, setTab] = useState<"account" | "security" | "history">("account");

  // Account state
  const [user_name, setUserName] = useState(user?.user_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [date_of_birth, setDateOfBirth] = useState(user?.date_of_birth || "");
  const [weight, setWeight] = useState(user?.weight || "");
  const [height, setHeight] = useState(user?.height || "");
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>(getImageUrl(user?.image));

  // Security state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password visibility state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // History state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>(props.recentLogs || []);

  // Sync with backend user
  useEffect(() => {
    setUserName(user?.user_name || "");
    setEmail(user?.email || "");
    setDateOfBirth(user?.date_of_birth || "");
    setWeight(user?.weight || "");
    setHeight(user?.height || "");
    setPreviewImage(getImageUrl(user?.image));
    setImage(null);
  }, [user]);

  // Sync recentLogs with props
  useEffect(() => {
    setRecentLogs(Array.isArray(props.recentLogs) ? props.recentLogs : []);
  }, [props.recentLogs]);

  // Only show final steps in the history list
  const finalLogs = (Array.isArray(recentLogs) ? recentLogs : []).filter(l => !!l.is_final_step);
  
  // Image upload/preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setImage(null);
      setPreviewImage(getImageUrl(user?.image));
    }
  };

  // --- Submit Account ---
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("user_name", user_name);
    formData.append("email", email);
    formData.append("date_of_birth", date_of_birth || "");
    formData.append("weight", weight || "");
    formData.append("height", height || "");
    if (image) formData.append("image", image);

    router.post("/settings/profile", formData, {
      forceFormData: true,
      onSuccess: () => {
        // Show success message to the user
      },
      onError: (errors) => {
        // Show error message to the user
      },
    });
  };

  // --- Submit Password Change ---
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New password and confirmation do not match!");
      return;
    }
    router.post("/settings/password", {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword,
    }, {
      onSuccess: () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Show success message if you want
      },
      onError: (errors) => {
        // Show error message if you want
      },
    });
  };

  // --- Refresh History ---
  const refreshLogs = () => {
    setIsRefreshing(true);
    router.reload({
      only: ["recentLogs"],
      onFinish: () => setTimeout(() => setIsRefreshing(false), 200),
    });
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex transition-colors duration-300 relative">
      {/* Sidebar - Desktop */}
      <aside className="w-64 fixed top-0 left-0 h-screen bg-white dark:bg-gray-800 shadow z-50 flex flex-col justify-between p-4 overflow-y-auto">
        <div>
          <div className="mb-8 flex flex-col items-center">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex justify-center mb-8 focus:outline-none"
              title="Refresh Page"
            >
              <img src="/assets/logo.jpg" alt="PiKrus Logo" className="h-12 object-contain mb-2" />
            </button>
            <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-300">Settings</h2>
          </div>
          {/* Back button just under logo/title */}
          <button
            onClick={() => {
              // if (window.history.length > 1) {
              //   window.history.back();
              // } else {
              //   router.get("/");
              // }
              router.get("/");
            }}
            className="mb-6 w-20 h-12 flex items-center justify-center bg-blue-600 dark:bg-blue-900 hover:bg-blue-700 dark:hover:bg-blue-950 text-white rounded-xl shadow-lg transition duration-200 mx-auto"
            title="Back to Previous Page"
          >
            <BiUndo className="text-2xl" /> Back
          </button>
          <nav className="space-y-2 flex-1 mt-6">
            <button
              onClick={() => setTab("account")}
              className={`w-full text-left font-medium px-3 py-2 rounded-lg ${tab === "account"
                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
            >
              Account
            </button>
            <button
              onClick={() => setTab("security")}
              className={`w-full text-left font-medium px-3 py-2 rounded-lg ${tab === "security"
                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
            >
              Security
            </button>
            <button
              onClick={() => setTab("history")}
              className={`w-full text-left font-medium px-3 py-2 rounded-lg ${tab === "history"
                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
            >
              History
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full md:ml-64 p-6 sm:p-10 space-y-10">
        <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-300">
          {tab === "account" && "Account Settings"}
          {tab === "security" && "Security Settings"}
          {tab === "history" && "History"}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-0">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              className={`px-8 py-3 font-semibold text-sm rounded-t-xl transition ${tab === "account"
                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-200"
                }`}
              onClick={() => setTab("account")}
            >
              Account
            </button>
            <button
              className={`px-8 py-3 font-semibold text-sm rounded-t-xl transition ${tab === "security"
                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-200"
                }`}
              onClick={() => setTab("security")}
            >
              Security
            </button>
            <button
              className={`px-8 py-3 font-semibold text-sm rounded-t-xl transition ${tab === "history"
                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-200"
                }`}
              onClick={() => setTab("history")}
            >
              History
            </button>
          </div>
          <div className="p-8">
            {tab === "account" && (
              <form onSubmit={handleSaveAccount} className="space-y-8">
                {/* Profile Image at the top */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300 mb-2">Profile Image</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="px-4 py-2 border rounded bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 w-full max-w-xs"
                    />
                    {previewImage && (
                      <img
                        src={previewImage}
                        alt="Profile"
                        className="h-24 w-24 rounded-full object-cover border-2 border-blue-200 dark:border-blue-700"
                      />
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Large images will be automatically resized to 300x300px and compressed.
                    </p>
                  </div>
                </div>
                {/* Personal Info */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300 mb-2">Personal Information</h3>
                  <input
                    type="text"
                    placeholder="Name"
                    value={user_name}
                    onChange={e => setUserName(e.target.value)}
                    className="w-full px-4 py-2 border rounded bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700"
                  />
                  <input
                    type="date"
                    placeholder="Date of Birth"
                    value={date_of_birth}
                    onChange={e => setDateOfBirth(e.target.value)}
                    className="w-full mt-3 px-4 py-2 border rounded bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700"
                  />
                  <input
                    type="text"
                    placeholder="Height (cm)"
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                    className="w-full mt-3 px-4 py-2 border rounded bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700"
                  />
                  <input
                    type="text"
                    placeholder="Weight (kg)"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    className="w-full mt-3 px-4 py-2 border rounded bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700"
                  />
                </div>
                {/* Email */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300 mb-2">Contact Details</h3>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700"
                  />
                </div>
                {/* Buttons */}
                <div className="flex justify-between">
                  <button type="button" className="text-gray-600 dark:text-gray-300 hover:underline">Cancel</button>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-900 dark:hover:bg-blue-950 text-white px-5 py-2 rounded-md">Save</button>
                </div>
              </form>
            )}
            {tab === "security" && (
              <form onSubmit={handleChangePassword} className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300 mb-2">Change Password</h3>
                  {/* Current Password */}
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Current Password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="bg-gray-100 dark:bg-gray-900 w-full px-4 py-2 border rounded dark:text-gray-200 dark:border-gray-700 pr-10 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(v => !v)}
                      className="absolute top-1/2 right-3 transform -translate-y-1/2 text-blue-600 dark:text-blue-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showCurrentPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                  {/* New Password */}
                  <div className="relative mt-3">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="New Password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="bg-gray-100 dark:bg-gray-900 w-full px-4 py-2 border rounded dark:text-gray-200 dark:border-gray-700 pr-10 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(v => !v)}
                      className="absolute top-1/2 right-3 transform -translate-y-1/2 text-blue-600 dark:text-blue-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showNewPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                  {/* Confirm New Password */}
                  <div className="relative mt-3">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="bg-gray-100 dark:bg-gray-900 w-full px-4 py-2 border rounded dark:text-gray-200 dark:border-gray-700 pr-10 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(v => !v)}
                      className="absolute top-1/2 right-3 transform -translate-y-1/2 text-blue-600 dark:text-blue-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <button type="button" className="text-gray-600 dark:text-gray-300 hover:underline">Cancel</button>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-900 dark:hover:bg-blue-950 text-white px-5 py-2 rounded-md">Save</button>
                </div>
              </form>
            )}
            {tab === "history" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300">History</h3>
                  <button
                    onClick={refreshLogs}
                    disabled={isRefreshing}
                    aria-busy={isRefreshing}
                    className={`text-sm px-3 py-1.5 rounded border flex items-center gap-2 transition 
                      ${isRefreshing ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                    title="Refresh recent logs"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden />
                    <span>{isRefreshing ? "Refreshing…" : "Refresh"}</span>
                  </button>
                </div>
                <div className={`transition-opacity duration-300 ${isRefreshing ? "opacity-60" : "opacity-100"}`}>
                  <ul className="space-y-3">
                    {isRefreshing &&
                      [0, 1, 2].map((i) => (
                        <li key={`sk-${i}`} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 animate-pulse">
                          <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-600 rounded mb-2" />
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-600 rounded" />
                            <div className="h-5 w-10 bg-green-100 dark:bg-green-800 rounded-full" />
                            <div className="ml-auto h-3 w-20 bg-gray-200 dark:bg-gray-600 rounded" />
                          </div>
                        </li>
                      ))}
                    {finalLogs.map((item) => {
                      const id = item?.id ?? Math.random();
                      const diagnosisId = item?.diagnosis_id;
                      const step = typeof item?.step === "number" ? item.step : 0;
                      const isFinal = !!item?.is_final_step;
                      const label = item?.label ?? "Untitled";
                      const date = item?.date ?? null;
                      return (
                        <li
                          key={id}
                          className="p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-sm transition cursor-pointer"
                          onClick={() => {
                            if (diagnosisId != null) router.get(`/diagnosis/${diagnosisId}`);
                          }}
                        >
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <span>Step {step}</span>
                            {isFinal && <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300">Final</span>}
                            {date && <span className="ml-auto">{date}</span>}
                          </div>
                        </li>
                      );
                    })}
                    {(finalLogs.length === 0) && !isRefreshing && (
                       <li className="text-sm text-gray-500 dark:text-gray-400">No history yet.</li>
                     )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingPatientPage;