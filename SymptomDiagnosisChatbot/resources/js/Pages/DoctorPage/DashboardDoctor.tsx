import React, { useState } from "react";
import Sidebar from "../../Layouts/SidebarDoctor";
import StatCard from "../statistics/StatCard";
import Header from "../../Layouts/HeaderAdmin";
import BarChart from "../statistics/BarChart";
import { FaUserInjured, FaKey, FaUserMd, FaBars } from "react-icons/fa";
import { usePage } from "@inertiajs/react";

type DashboardProps = {
  stats: {
    totalPatients: number;
    totalDoctors: number;
    totalDiseases: number;
  };
  weeklyPatientTrend: { name: string; value: number }[];
  diseaseTypes: { name: string; percentage: number; color: string }[];
  notifications: {
    id: string;
    data: {
      title: string;
      message: string;
      pending_id: number;
    };
  }[];
};

const Dashboard: React.FC = () => {
  const { stats, weeklyPatientTrend, diseaseTypes, notifications = [] } =
  usePage<DashboardProps>().props;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 text-gray-900 dark:text-white flex relative">
      {/* Sidebar */}
      <aside className="hidden sm:block fixed inset-y-0 left-0 w-64 z-40 bg-white dark:bg-gray-800 shadow-lg">
        <Sidebar />
      </aside>

      {/* Mobile sidebar toggle */}
      <div className="sm:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white dark:bg-gray-700 rounded-full shadow"
        >
          <FaBars />
        </button>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 h-full bg-white dark:bg-gray-800 shadow-lg">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <main className="flex-1 w-full sm:ml-64 px-4 py-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          <Header title="Dashboard" />

          <div className="border-2 border-blue-400 dark:border-blue-700 rounded-xl p-4 sm:p-6 bg-white dark:bg-gray-900 shadow-md space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                icon={<FaUserInjured />}
                label="Total Patients"
                value={stats.totalPatients}
              />
              <StatCard
                icon={<FaKey />}
                label="Total Knowledgebases"
                value={stats.totalDiseases}
              />
              <StatCard
                icon={<FaUserMd />}
                label="Total Doctors"
                value={stats.totalDoctors}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
              <BarChart data={diseaseTypes} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
