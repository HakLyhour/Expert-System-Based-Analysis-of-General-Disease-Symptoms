import React, { useEffect, useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import SidebarAdmin from "../../Layouts/SidebarAdmin";
import SidebarDoctor from "../../Layouts/SidebarDoctor";
import HeaderAdmin from "../../Layouts/HeaderAdmin";
import HeaderDoctor from "../../Layouts/HeaderDoctor";
import { FaPlus, FaSearch, FaBars } from "react-icons/fa";

interface Disease {
    id: number;
    disease_name: string;
}

interface Symptom {
    id: number;
    name: string;
    disease?: Disease;
}

interface EditSymptomProps {
    symptoms: Symptom[];
}

const emptySymptom: Symptom = {
    id: 0,
    name: "",
};

export default function EditSymptomPage({ symptoms = [] }: EditSymptomProps) {
    // Inertia props (optional server feedback)
    const { props } = usePage() as { props: { success?: string; errors?: Record<string, string>; auth?: { user?: { role?: string } } } };

    useEffect(() => {
        if (props.success) {
            // simple feedback - replace with toast if you have one
            alert(props.success);
        }
    }, [props.success]);

    // choose Sidebar/Header based on role (like KnowledgeBasePage)
    const role = props.auth?.user?.role ?? "admin";
    const SidebarComponent = role === "doctor" ? SidebarDoctor : SidebarAdmin;
    const HeaderComponent = role === "doctor" ? HeaderDoctor : HeaderAdmin;

    // UI state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [menuOpenIndex, setMenuOpenIndex] = useState<number | null>(null);

    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // form state & errors
    const [form, setForm] = useState<Symptom>({ ...emptySymptom });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Filtered & paginated - now includes disease name in search
    const filtered = useMemo(
        () =>
            symptoms.filter((s) =>
                s.name.toLowerCase().includes(search.toLowerCase()) ||
                (s.disease?.disease_name && s.disease.disease_name.toLowerCase().includes(search.toLowerCase()))
            ),
        [symptoms, search]
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const start = (currentPage - 1) * itemsPerPage;
    const currentSymptoms = filtered.slice(start, start + itemsPerPage);

    // Form handlers
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    }

    function openAddModal() {
        setEditingIndex(null);
        setForm({ ...emptySymptom });
        setIsModalOpen(true);
        setMenuOpenIndex(null);
        setErrors({});
    }

    function openEditModal(indexInPage: number) {
        const realIndex = start + indexInPage;
        const s = filtered[realIndex];
        if (!s) return;
        setEditingIndex(realIndex);
        setForm({
            id: s.id,
            name: s.name || "",
        });
        setIsModalOpen(true);
        setMenuOpenIndex(null);
        setErrors({});
    }

    function closeModal() {
        setIsModalOpen(false);
        setEditingIndex(null);
        setForm({ ...emptySymptom });
        setErrors({});
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // Client validation: name required and reasonable length
        if (!form.name || form.name.trim().length < 2) {
            setErrors({ name: "Name is required (min 2 characters)." });
            return;
        }

        // Prepare payload containing only the DB fields (name)
        if (editingIndex !== null) {
            // Update existing symptom
            const symptomId = form.id;
            const payload = {
                name: form.name.trim(),
                _method: "put",
            };
            router.post(`/editsymptom/${symptomId}`, payload, {
                onSuccess: () => {
                    closeModal();
                },
                onError: (errs: any) => {
                    // keep errors shape flexible
                    setErrors(errs || {});
                },
            });
        } else {
            // Create new symptom
            router.post("/symptoms", { name: form.name.trim() }, {
                onSuccess: () => {
                    closeModal();
                    setCurrentPage(1); // optional: show first page
                },
                onError: (errs: any) => {
                    setErrors(errs || {});
                },
            });
        }
    }

    return (
        <div className="flex min-h-screen bg-blue-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200 relative transition-colors duration-300">
            {/* Sidebar (desktop) */}
            <aside className="hidden sm:block fixed inset-y-0 left-0 w-64 z-40 bg-white dark:bg-gray-800 shadow-lg">
                <SidebarComponent />
            </aside>

            {/* Mobile hamburger */}
            <div className="sm:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 bg-white dark:bg-gray-700 rounded-full shadow"
                    aria-label="Open sidebar"
                >
                    <FaBars />
                </button>
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="w-64 h-full bg-white dark:bg-gray-800 shadow-lg">
                        <SidebarComponent />
                    </div>
                    <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
                </div>
            )}

            <main className="flex-1 sm:ml-64 p-6 w-full">
                <HeaderComponent title="Edit Symptoms" />

                {/* Controls */}
                <div className="bg-blue-100 dark:bg-gray-700 rounded-xl p-6 shadow-md mb-6">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <button
                            onClick={openAddModal}
                            className="bg-blue-700 dark:bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-blue-800 dark:hover:bg-blue-950"
                        >
                            <FaPlus /> ADD SYMPTOM
                        </button>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search symptoms..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-blue-300 dark:border-gray-700 overflow-auto">
                    <table className="w-full text-sm sm:text-base border-collapse">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
                                <th className="px-3 py-2 text-left">Symptom Name</th>
                                <th className="px-3 py-2 text-left">Disease Name</th>
                                <th className="px-3 py-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentSymptoms.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-3 py-6 text-center text-gray-500">
                                        No symptoms found.
                                    </td>
                                </tr>
                            ) : (
                                currentSymptoms.map((s, idx) => {
                                    const realIndex = start + idx;
                                    return (
                                        <tr
                                            key={s.id}
                                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition"
                                        >
                                            <td className="px-3 py-2">{s.name}</td>
                                            <td className="px-3 py-2">{s.disease?.disease_name || '-'}</td>
                                            <td className="px-3 py-2">
                                                <button
                                                    onClick={() => openEditModal(idx)}
                                                    className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>

                    </table>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-300 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <span>Display</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="border border-gray-300 rounded px-2 py-1 bg-white dark:bg-gray-800"
                            >
                                {[10, 25, 50].map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-2 py-1 border rounded disabled:opacity-50"
                            >
                                &lt;
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`px-3 py-1 rounded ${currentPage === i + 1
                                        ? "bg-red-500 text-white"
                                        : "border border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-2 py-1 border rounded disabled:opacity-50"
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl p-6 space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                            {editingIndex !== null ? "Edit Symptom" : "Add Symptom"}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <input
                                        name="name"
                                        placeholder="Symptom name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                                </div>

                                <div className="space-y-4">
                                    {/* Empty right column for symmetry; you can add help text here */}
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Keep names unique — the DB migration requires `name` to be unique.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 mt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-6 py-2 rounded-lg border border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 rounded-lg bg-blue-600 dark:bg-blue-900 text-white hover:bg-blue-700 dark:hover:bg-blue-950"
                                >
                                    {editingIndex !== null ? "Update" : "Add"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}