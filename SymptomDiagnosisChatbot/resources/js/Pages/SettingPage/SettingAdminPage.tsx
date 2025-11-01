import React, { useEffect, useState } from "react";
import { usePage, router, Link } from "@inertiajs/react";
import SidebarAdmin from "../../Layouts/SidebarAdmin";
import SidebarDoctor from "../../Layouts/SidebarDoctor";
import { BiUndo } from "react-icons/bi";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Use the same icons as Login.tsx

type User = {
  user_name: string;
  email: string;
  date_of_birth?: string;
  weight?: string;
  height?: string;
  image?: string;
};

type PageProps = {
  user: User;
};

const DEFAULT_IMAGE = "/assets/User.png";
const getImageUrl = (image?: string) => {
  if (!image) return DEFAULT_IMAGE;
  if (image.startsWith("users/")) return `/storage/${image}`;
  return `/assets/${image.replace(/^\/+/, "")}`;
};

const SettingAdminPage: React.FC = () => {
  //const { props } = usePage<PageProps>();
  const { props } = usePage() as { props: PageProps & { auth: { user: { role: string } } }};
  const user = props.user || {};

  // Tab state: "account" or "security"
  const [tab, setTab] = useState<"account" | "security">("account");

  const role = props.auth?.user?.role ?? 'user';
      const SidebarComponent = role === 'doctor' ? SidebarDoctor : SidebarAdmin;

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

  // Image upload/preview
  // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0] || null;
  //   setImage(file);
  //   if (file) setPreviewImage(URL.createObjectURL(file));
  //   else setPreviewImage(getImageUrl(user?.image));
  // };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImage(file);  // this makes sure FormData includes a real File
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

    console.log({ user_name, email, date_of_birth, weight, height });
    router.post("/settings/profile", formData, {
      forceFormData: true,
      onSuccess: () => {
        console.log("Profile updated successfully!");
        // Show success message to the user
      },
      onError: (errors) => {
        console.error("Error updating profile:", errors);
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

  // --- Render ---
  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex transition-colors duration-300 relative">
      {/* Sidebar (desktop) */}
      <aside className="hidden sm:block fixed inset-y-0 left-0 w-64 z-40 bg-white dark:bg-gray-800 shadow-lg">
        <SidebarComponent />
      </aside>
      {/* Main Content */}
      <main className="flex-1 w-full md:ml-64 p-6 sm:p-10 space-y-10">
        <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-300">Account Settings</h2>
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
          </div>
          <div className="p-8">
            {tab === "account" ? (
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
            ) : (
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingAdminPage;
