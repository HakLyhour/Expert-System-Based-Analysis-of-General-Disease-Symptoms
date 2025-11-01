import React, { useState } from "react";
import { router } from "@inertiajs/react";
import SidebarAdmin from "../../Layouts/SidebarAdmin";
import HeaderAdmin from "../../Layouts/HeaderAdmin";
import { FaBars, FaCheck, FaTimes, FaEye } from "react-icons/fa";

interface Doctor {
  id: number;
  name: string;
}

interface PendingKnowledgebase {
  id: number;
  disease_name: string;
  disease_type: string;
  disease_description: string;
  symptoms: string[];
  treatment: string;
  priorillnesses: string[];
  doctor: Doctor;
  created_at: string;
}

interface PendingKnowledgebasesProps {
  pending: PendingKnowledgebase[];
}

const PendingKnowledgebases: React.FC<PendingKnowledgebasesProps> = ({ pending }) => {
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewModal, setViewModal] = useState<PendingKnowledgebase | null>(null);

  const handleApprove = (id: number) => {
    if (!confirm("Are you sure you want to approve this knowledgebase?")) return;
    
    setProcessingId(id);
    router.post(`/pending-knowledgebases/${id}/approve`, {}, {
      preserveScroll: true,
      onFinish: () => setProcessingId(null),
      onSuccess: () => {
        alert('✓ Knowledgebase approved successfully!');
      }
    });
  };

  const handleReject = (id: number) => {
    if (!confirm("Are you sure you want to reject this knowledgebase request?")) return;
    
    setProcessingId(id);
    router.delete(`/pending-knowledgebases/${id}`, {
      preserveScroll: true,
      onFinish: () => setProcessingId(null),
      onSuccess: () => {
        alert('Knowledgebase request rejected.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white flex relative">
      {/* Sidebar */}
      <aside className="hidden sm:block fixed inset-y-0 left-0 w-64 z-40 bg-white dark:bg-gray-900 shadow-xl border-r border-blue-200 dark:border-gray-800">
        <SidebarAdmin />
      </aside>

      {/* Mobile toggle */}
      <div className="sm:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-blue-600 dark:bg-blue-800 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          <FaBars />
        </button>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 h-full bg-white dark:bg-gray-900 shadow-xl border-r border-blue-200 dark:border-gray-800">
            <SidebarAdmin />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main */}
      <main className="flex-1 w-full sm:ml-64 px-4 py-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-8">
          <HeaderAdmin title="Pending Knowledgebases" />

          <div className="rounded-2xl p-6 bg-white/80 dark:bg-gray-900/80 shadow-xl border border-blue-200 dark:border-gray-800">
            {pending.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No pending knowledgebase requests.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-blue-100 dark:border-gray-800">
                <table className="w-full text-gray-800 dark:text-white">
                  <thead className="bg-blue-50 dark:bg-gray-800 border-b dark:border-gray-700">
                    <tr>
                      <th className="p-3 text-left font-semibold">Disease</th>
                      <th className="p-3 text-left font-semibold">Type</th>
                      <th className="p-3 text-left font-semibold">Doctor</th>
                      <th className="p-3 text-left font-semibold">Submitted</th>
                      <th className="p-3 text-center font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((item) => (
                      <tr key={item.id} className="border-b last:border-b-0 hover:bg-blue-100/60 dark:hover:bg-gray-800/60 transition">
                        <td className="p-3">{item.disease_name}</td>
                        <td className="p-3">{item.disease_type}</td>
                        <td className="p-3">{item.doctor?.name || "Unknown"}</td>
                        <td className="p-3">{item.created_at}</td>
                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => setViewModal(item)}
                              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => handleApprove(item.id)}
                              disabled={processingId === item.id}
                              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Approve"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => handleReject(item.id)}
                              disabled={processingId === item.id}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Reject"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* View Modal */}
      {viewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-2xl space-y-6 border border-blue-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-4">
              Knowledgebase Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <strong className="text-blue-600 dark:text-blue-400">Disease Name:</strong>
                <p className="mt-1">{viewModal.disease_name}</p>
              </div>

              <div>
                <strong className="text-blue-600 dark:text-blue-400">Type:</strong>
                <p className="mt-1">{viewModal.disease_type}</p>
              </div>

              <div>
                <strong className="text-blue-600 dark:text-blue-400">Description:</strong>
                <p className="mt-1 whitespace-pre-wrap">{viewModal.disease_description}</p>
              </div>

              <div>
                <strong className="text-blue-600 dark:text-blue-400">Symptoms:</strong>
                <div className="mt-2 flex flex-wrap gap-2">
                  {viewModal.symptoms.map((symptom, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-sm">
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <strong className="text-blue-600 dark:text-blue-400">Treatment:</strong>
                <p className="mt-1 whitespace-pre-wrap">{viewModal.treatment}</p>
              </div>

              <div>
                <strong className="text-blue-600 dark:text-blue-400">Prior Illnesses:</strong>
                <div className="mt-2 flex flex-wrap gap-2">
                  {viewModal.priorillnesses.map((illness, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-900 rounded-full text-sm">
                      {illness}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <strong className="text-blue-600 dark:text-blue-400">Submitted by:</strong>
                <p className="mt-1">{viewModal.doctor.name}</p>
              </div>

              <div>
                <strong className="text-blue-600 dark:text-blue-400">Submitted on:</strong>
                <p className="mt-1">{viewModal.created_at}</p>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={() => setViewModal(null)}
                className="px-6 py-2 border border-blue-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-gray-800 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleApprove(viewModal.id);
                  setViewModal(null);
                }}
                disabled={processingId === viewModal.id}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  handleReject(viewModal.id);
                  setViewModal(null);
                }}
                disabled={processingId === viewModal.id}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
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

export default PendingKnowledgebases;