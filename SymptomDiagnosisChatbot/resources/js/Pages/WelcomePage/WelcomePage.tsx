import React, { useEffect, useRef, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { History as HistoryIcon, X as CloseIcon, RefreshCw } from "lucide-react";
import NavbarAuthActions from "@/components/NavbarAuthActions";

type AuthUser = {
  id: number;
  user_name?: string | null;
  email?: string | null;
};

type RecentLog = {
  id: number;
  diagnosis_id: number;
  step: number;
  is_final_step: boolean;
  label: string;
  date: string | null; // formatted on backend "Y-m-d H:i"
};

type PageProps = {
  auth?: { user?: AuthUser | null } | null;
  recentLogs?: RecentLog[] | null;
};

export default function WelcomePage(): React.ReactElement {
  const { props } = usePage<PageProps>();

  // --- auth guard
  const authUser = props?.auth?.user ?? null;
  const isLoggedIn = !!authUser;

  // --- recent logs state (from diagnosis_logs via backend)
  const initialLogs: RecentLog[] = Array.isArray(props?.recentLogs) ? props.recentLogs! : [];
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>(initialLogs);

  // --- ui state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerH, setHeaderH] = useState(64);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const sidebarRef = useRef<HTMLElement | null>(null);

  // sync when Inertia sends new props
  useEffect(() => {
    setRecentLogs(Array.isArray(props?.recentLogs) ? props.recentLogs! : []);
  }, [props?.recentLogs]);

  // measure header height
  useEffect(() => {
    const measure = () => {
      const h =
        headerRef.current && typeof headerRef.current.offsetHeight === "number"
          ? headerRef.current.offsetHeight
          : 64;
      setHeaderH(h);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // close sidebar on outside click
  useEffect(() => {
    interface HasComposedPath {
      composedPath?: () => EventTarget[];
    }

    const onDown = (e: MouseEvent) => {
      if (!sidebarOpen) return;
      const sidebarEl = sidebarRef.current;
      if (!sidebarEl) return;

      const ev = e as MouseEvent & HasComposedPath;
      const path = typeof ev.composedPath === "function" ? ev.composedPath() : undefined;
      if (Array.isArray(path) && path.includes(sidebarEl)) return;

      const target = e.target as Node | null;
      if (target && sidebarEl.contains(target)) return;

      setSidebarOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [sidebarOpen]);

  const toggleSidebar = () => setSidebarOpen((p) => !p);

  // refresh only recentLogs
  const refreshLogs = () => {
    setIsRefreshing(true);
    router.reload({
      only: ["recentLogs"],
      onFinish: () => setTimeout(() => setIsRefreshing(false), 200),
    });
  };

  return (
    <div className="relative min-h-screen bg-blue-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
      {/* Header */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 flex justify-between items-center px-4 sm:px-8 py-4 bg-blue-50 dark:bg-gray-900 z-30 border-b border-gray-200 dark:border-gray-700"
      >
        <Link href="/" className="flex items-center">
          <img src="/assets/logo.jpg" alt="PiKrus Logo" className="h-12 w-auto object-contain" />
        </Link>

        <div className="flex items-center gap-4">
          {isLoggedIn && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
              title={sidebarOpen ? "Hide History" : "Show History"}
            >
              {sidebarOpen ? (
                <CloseIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <HistoryIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          )}
          <NavbarAuthActions />
        </div>
      </header>

      {/* Main */}
      <main className="w-full" style={{ paddingTop: headerH }}>
        <div
          className={`flex flex-col items-center justify-center px-4 sm:px-6 transition-all duration-300 ${
            isLoggedIn && sidebarOpen ? "md:mr-[25%]" : "md:mr-0"
          }`}
          style={{ minHeight: `calc(100vh - ${headerH}px)` }}
        >
          <div className="w-full max-w-5xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-blue-600 dark:text-blue-400 mb-4 text-center">
              How Can I Help You?
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-8 text-center">
              Choose what you want to know?
            </p>

            {/* Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div
                className="card border-2 border-blue-300 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 hover:shadow-lg transition-colors cursor-pointer"
                onClick={() => router.get("/symptom-form")}
              >
                <h2 className="text-xl sm:text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  Health Diagnosis
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Symptom Checker</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Analyze your symptoms and receive information about possible diseases and solutions.
                </p>
              </div>

              {/* Card 2 */}
              <div
                className="card border-2 border-blue-300 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 hover:shadow-lg transition-colors cursor-pointer"
                onClick={() => router.get("/health-roadmap")}
              >
                <h2 className="text-xl sm:text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  Health Roadmap
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Disease Explorer</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Explore a disease's background, impact across age groups, symptoms, severity, and solutions.
                </p>
              </div>

              {/* Card 3 */}
              <div
                className="card border-2 border-blue-300 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 hover:shadow-lg transition-colors cursor-pointer"
                onClick={() => router.get("/settings/profile")}
              >
                <h2 className="text-xl sm:text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  Your Health History
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Disease Records</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  View your past diagnoses and health records for better tracking and management.
                </p>
              </div>
            </div>

            <footer className="mt-12 text-center text-xs sm:text-sm py-4 border-t border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
              Pikrus can be wrong, please double check!
            </footer>
          </div>
        </div>
      </main>

      {/* Sidebar */}
      {isLoggedIn && (
        <aside
          ref={sidebarRef}
          className={`fixed right-0 w-full md:w-1/4 bg-white dark:bg-gray-800 p-4 sm:p-6 overflow-y-auto border-l border-gray-200 dark:border-gray-700 z-20 transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ top: headerH, height: `calc(100vh - ${headerH}px)` }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200">Recently</h3>

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

              {(Array.isArray(recentLogs) ? recentLogs : []).map((item) => {
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

              {(!Array.isArray(recentLogs) || recentLogs.length === 0) && !isRefreshing && (
                <li className="text-sm text-gray-500 dark:text-gray-400">No recent activity yet.</li>
              )}
            </ul>
          </div>
        </aside>
      )}
    </div>
  );
}
