import React, { useEffect, useRef, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { FaSignOutAlt, FaCog, FaQuestionCircle, FaFileAlt } from "react-icons/fa";

const ProfileMenu: React.FC<{ setProfileOpen: (val: boolean) => void }> = ({ setProfileOpen }) => {
  const handleLogout = () => {
    router.post("/logout", {}, { onFinish: () => setProfileOpen(false) });
  };

  return (
    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
      <ul className="py-1 text-sm">
        <li>
          <Link
            href="/setting"
            className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            
            Settings
          </Link>
        </li>
        <li>
          <Link
            href="/how-to-use"
            className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            
            How to use PiKrus
          </Link>
        </li>
        <li>
          <Link
            href="/terms-policy"
            className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            
            Terms & Policy
          </Link>
        </li>
        <li>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            
            Log Out
          </button>
        </li>
      </ul>
    </div>
  );
};

type InertiaAuthProps = { auth?: { user?: { user_name?: string; image?: string } | null } };

const NavbarAuthActions: React.FC = () => {
  const { props } = usePage<InertiaAuthProps>();
  const user = props.auth?.user;
  const { auth } = usePage().props as any;

  // get profile image
  const profileImage =
    auth?.user?.image
      ? (auth.user.image.startsWith('users/')
        ? `/storage/${auth.user.image}`
        : `/assets/${auth.user.image.replace(/^\/+/, '')}`)
      : "/assets/User.png";

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (user) {
    return (
      <div ref={profileRef} className="relative">
        {/* Blue pill background with avatar */}
        <button
          onClick={() => setProfileOpen((prev) => !prev)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 shadow-md transition-colors"
        >
          <img
            src={profileImage}
            alt={user.user_name || "User"}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/assets/User.png";
            }}
            className="h-7 w-7 rounded-full object-cover border-2 border-white"
          />
          <span className="text-sm font-medium">{user.user_name}</span>
        </button>

        {profileOpen && <ProfileMenu setProfileOpen={setProfileOpen} />}
      </div>
    );
  }

  // Not logged in
  return (
    <li className="flex items-center gap-2">
      <Link
        href="/login"
        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow text-sm transition-colors"
      >
        Login
      </Link>
      <Link
        href="/register"
        className="px-5 py-2 bg-white text-blue-600 border border-blue-600 rounded-full text-sm hover:bg-blue-50 dark:bg-transparent dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700 transition-colors"
      >
        Sign Up
      </Link>
    </li>
  );
};

export default NavbarAuthActions;
