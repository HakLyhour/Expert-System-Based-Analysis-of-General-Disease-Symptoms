import React, { useState } from "react";
import Sidebar from "../../Layouts/SidebarAdmin";
import StatCard from "../statistics/StatCard";
import Header from "../../Layouts/HeaderAdmin";
import BarChart from "../statistics/BarChart";
import { FaUserInjured, FaKey, FaUserMd, FaBars } from "react-icons/fa";
import { usePage, router } from "@inertiajs/react";

type DashboardProps = {
  stats: {
    totalPatients: number;
    totalDoctors: number;
    totalDiseases: number;
  };
  weeklyPatientTrend: { name: string; value: number }[];
  diseaseTypes: { name: string; percentage: number; color: string }[];
  pendingNotifications?: any[];
};

const Dashboard: React.FC = () => {
  const { stats, weeklyPatientTrend, diseaseTypes, pendingNotifications = [] } =
    usePage<DashboardProps>().props;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  function openPending(pending: any) {
    setSelected(pending);
    setModalOpen(true);
  }

  function closeModal() {
    setSelected(null);
    setModalOpen(false);
  }

  function approve(id: number) {
    if (!confirm("Approve this knowledgebase request?")) return;
    router.post(`/admin/pending-knowledgebases/${id}/approve`, {}, {
      onSuccess: () => {
        closeModal();
      },
    });
  }

  function reject(id: number) {
    if (!confirm("Reject this knowledgebase request?")) return;
    router.delete(`/admin/pending-knowledgebases/${id}`, {
      onSuccess: () => {
        closeModal();
      },
    });
  }

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 text-gray-900 dark:text-white flex relative">
      {/* Sidebar */}
      <aside className="hidden sm:block fixed inset-y-0 left-0 w-64 z-40 bg-white dark:bg-gray-800 shadow-lg">
        <Sidebar />
      </aside>

      {/* mobile toggle */}
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
              <StatCard icon={<FaUserInjured />} label="Total Patients" value={stats.totalPatients} />
              <StatCard icon={<FaKey />} label="Total Knowledgebases" value={stats.totalDiseases} />
              <StatCard icon={<FaUserMd />} label="Total Doctors" value={stats.totalDoctors} />
            </div>

            {/* Pending requests (rendered inline, below stat cards) */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Pending Knowledgebase Requests</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {pendingNotifications.length} request{pendingNotifications.length !== 1 ? "s" : ""}
                </div>
              </div>

              <div className="space-y-3">
                {pendingNotifications.length === 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">No pending requests.</div>
                )}

                {pendingNotifications.map((n: any) => (
                  <div key={n.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded p-3 shadow-sm">
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{n.disease_name || "New request"}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{n.disease_type}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{n.disease_description}</div>
                      <div className="text-xs text-gray-400 mt-1">By: {n.doctor?.name ?? "Unknown"}</div>
                    </div>

                    <div className="ml-4 flex-shrink-0">
                      <button
                        onClick={() => openPending(n)}
                        type="button"
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-medium rounded-md shadow"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
              <BarChart data={diseaseTypes} />
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {modalOpen && selected && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* full-screen backdrop (below modal) */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

          {/* modal content (above backdrop) */}
          <div className="relative z-[100000] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-2xl space-y-6 border border-blue-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-2">
              Knowledgebase Details
            </h2>

            <div className="space-y-4">
              <div>
                <strong className="text-blue-600 dark:text-blue-400">Disease Name:</strong>
                <p className="mt-1">{selected.disease_name}</p>
              </div>

              <div>
                <strong className="text-blue-600 dark:text-blue-400">Type:</strong>
                <p className="mt-1">{selected.disease_type}</p>
              </div>

              <div>
                <strong className="text-blue-600 dark:text-blue-400">Description:</strong>
                <p className="mt-1 whitespace-pre-wrap">{selected.disease_description}</p>
              </div>

              <div>
                <strong className="text-blue-600 dark:text-blue-400">Symptoms:</strong>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(selected.symptoms ?? selected.symptom_ids ?? []).map((s: any, i: number) => (
                    <span key={i} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-sm">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <strong className="text-blue-600 dark:text-blue-400">Treatment:</strong>
                <p className="mt-1 whitespace-pre-wrap">{selected.treatment ?? selected.treatment_description}</p>
              </div>

              <div>
                <strong className="text-blue-600 dark:text-blue-400">Prior Illnesses:</strong>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(selected.priorillnesses ?? selected.priorillness_ids ?? []).map((p: any, i: number) => (
                    <span key={i} className="px-3 py-1 bg-purple-100 dark:bg-purple-900 rounded-full text-sm">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <strong className="text-blue-600 dark:text-blue-400">Submitted by:</strong>
                <p className="mt-1">{selected.doctor?.name ?? selected.doctor_name ?? "Unknown"}</p>
              </div>

              <div>
                <strong className="text-blue-600 dark:text-blue-400">Submitted on:</strong>
                <p className="mt-1">{selected.created_at}</p>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={closeModal}
                className="px-6 py-2 border border-blue-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-gray-800 transition"
                type="button"
              >
                Close
              </button>
              <button
                onClick={() => { approve(selected.id); setSelected(null); }}
                disabled={false}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                type="button"
              >
                Approve
              </button>
              <button
                onClick={() => { reject(selected.id); setSelected(null); }}
                disabled={false}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                type="button"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
