import React from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "@/components/ThemeProvider";
import { usePage } from "@inertiajs/react";

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { theme, setTheme } = useTheme();
  const { auth } = usePage().props as any;

  const handleToggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const profileImage =
    auth?.user?.image
      ? (auth.user.image.startsWith('users/')
        ? `/storage/${auth.user.image}`
        : `/assets/${auth.user.image.replace(/^\/+/, '')}`)
      : "/assets/User.png";



  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <h1 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h1>
      <div className="flex items-center space-x-3">
        <button
          onClick={handleToggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {theme === "dark" ? (
            <FaSun className="text-yellow-400" />
          ) : (
            <FaMoon className="text-gray-600" />
          )}
        </button>
        <img
          src={profileImage}
          alt="Profile"
          className="h-10 w-10 rounded-full object-cover border-2 border-blue-500"
        />
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {auth?.user?.user_name || "Guest"}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-300">
            {auth?.user?.role || ""}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
