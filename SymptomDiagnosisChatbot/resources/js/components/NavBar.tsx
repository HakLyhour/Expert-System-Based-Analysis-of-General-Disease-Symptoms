import React, { useState, useEffect, useRef } from "react";
import { FaBars, FaMoon, FaSun } from "react-icons/fa";
import { Link, usePage, router } from "@inertiajs/react";
import { useTheme } from "./ThemeProvider";

type AuthUser = {
  id: number;
  user_name: string;
  email: string;
  image?: string;
};

type PageProps = {
  auth?: {
    user?: AuthUser;
  };
};

const sections = ["home", "purpose", "privacy", "about"] as const;
type Section = typeof sections[number];

const labels: Record<Section, string> = {
  home: "Home",
  purpose: "Purpose",
  privacy: "Privacy & Policy",
  about: "About Us",
};

export default function NavBar() {
  const { props } = usePage<PageProps>();
  const user = props.auth?.user;

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // <-- New state for modal
  const profileRef = useRef<HTMLDivElement>(null);

  const [active, setActive] = useState<Section>("home");
  const { theme, setTheme } = useTheme();

  const { auth } = usePage().props as any;

  // get profile image
  const profileImage =
    auth?.user?.image
      ? (auth.user.image.startsWith('users/')
        ? `/storage/${auth.user.image}`
        : `/assets/${auth.user.image.replace(/^\/+/, '')}`)
      : "/assets/User.png";

  // Section scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + window.innerHeight / 3;
      let current: Section = "home";
      for (const sec of sections) {
        const el = document.getElementById(sec);
        if (el && el.offsetTop <= scrollY) {
          current = sec;
        }
      }
      setActive(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [profileOpen]);

  const scrollToSection = (sec: Section) => {
    const el = document.getElementById(sec);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  const linkClass = (sec: Section) =>
    active === sec
      ? "px-4 py-1 rounded-full bg-blue-100 text-blue-600 text-sm dark:bg-gray-700 dark:text-white"
      : "px-4 py-1 rounded-full text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 text-sm";

  const handleToggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Handle logout button in ProfileDropdown
  const handleLogoutClick = () => {
    setProfileOpen(false);
    setShowLogoutModal(true);
  };

  // Confirm the logout in modal
  const confirmLogout = () => {
    setShowLogoutModal(false);
    router.post("/logout");
  };

  // Dropdown component for profile actions (moved inline for modal integration)
  function ProfileDropdown({ onClose }: { onClose: () => void }) {
    return (
      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
        <ul className="py-1 text-sm">
          {/* <li>
            <Link
              href='/profile'
              className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={onClose}
            >
              Profile
            </Link>
          </li> */}
          <li>
            <Link
              href='/how-to-use'
              className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              How to use PiKrus
            </Link>
          </li>
          <li>
            <Link
              href='/terms-policy'
              className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Terms & Policy
            </Link>
          </li>
          <li>
            <Link
              href='/settings/profile'
              className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={onClose}
            >
              Settings
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogoutClick} // <-- Open modal
              className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Log Out
            </button>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-white dark:bg-gray-900 shadow dark:shadow-md transition-colors">
      <div className="top-0 left-0 right-0 flex items-center justify-between px-3 sm:px-8 py-3 z-20">
        <Link href='/' className="flex items-center gap-2">
          <img
            src="/assets/logo.jpg"
            alt="PiKrus Logo"
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-4">
          <ul className="flex items-center gap-6">
            {sections.map((sec) => (
              <li key={sec}>
                <button onClick={() => scrollToSection(sec)} className={linkClass(sec)}>
                  {labels[sec]}
                </button>
              </li>
            ))}
            {/* Authenticated User or Auth Actions */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm shadow transition-colors focus:outline-none"
                  onClick={() => setProfileOpen((v) => !v)}
                  type="button"
                >
                  <img
                    //src={user.image || "/assets/User.png"}
                    src={profileImage}
                    alt={user.user_name}
                    className="h-6 w-6 rounded-full object-cover border"
                  />
                  <span>{user.user_name}</span>
                </button>
                {profileOpen && <ProfileDropdown onClose={() => setProfileOpen(false)} />}
              </div>
            ) : (
              <>
                <li>
                  <Link
                    href='/login'
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow text-sm transition-colors"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href='/register'
                    className="px-5 py-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-white border border-blue-600 rounded-full text-sm hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>

          <button
            onClick={handleToggleTheme}
            className="ml-4 p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === "dark" ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-600" />}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="sm:hidden flex items-center gap-2">
          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === "dark" ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-600" />}
          </button>

          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="text-2xl text-blue-600 dark:text-white"
          >
            <FaBars />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="sm:hidden bg-white dark:bg-gray-900 shadow rounded-b-xl px-4 pb-4 mt-2 mx-4 transition-all">
          <ul className="flex flex-col gap-3 text-center">
            {sections.map((sec) => (
              <li key={sec}>
                <button onClick={() => scrollToSection(sec)} className={linkClass(sec)}>
                  {labels[sec]}
                </button>
              </li>
            ))}
            {user ? (
              <div className="relative mt-2" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm shadow transition-colors w-full"
                  type="button"
                >
                  <img
                    src={user.image || "/assets/User.png"}
                    alt={user.user_name}
                    className="h-6 w-6 rounded-full object-cover border"
                  />
                  <span>{user.user_name}</span>
                </button>
                {profileOpen && <ProfileDropdown onClose={() => setProfileOpen(false)} />}
              </div>
            ) : (
              <li className="flex justify-center gap-2 mt-2">
                <Link
                  href='/login'
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow text-sm transition-colors"
                >
                  Login
                </Link>
                <Link
                  href='/register'
                  className="px-5 py-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-white border border-blue-600 rounded-full text-sm hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Sign Up
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
              Confirm Log Out
            </h2>
            <p className="text-sm mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
