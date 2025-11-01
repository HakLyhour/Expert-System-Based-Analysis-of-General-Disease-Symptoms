// import React, { useEffect, useMemo, useState } from "react";
// import { router, usePage } from "@inertiajs/react";
// import SidebarAdmin from "../../Layouts/SidebarAdmin";
// import SidebarDoctor from "../../Layouts/SidebarDoctor";
// import HeaderAdmin from "../../Layouts/HeaderAdmin";
// import HeaderDoctor from "../../Layouts/HeaderDoctor";
// import { FaPlus, FaSearch, FaBars } from "react-icons/fa";

// interface PriorIllness {
//   id: number;
//   priorillness_name: string;
// }

// interface PriorIllnessProps {
//   priorIllnesses: PriorIllness[];
// }

// const emptyItem: PriorIllness = {
//   id: 0,
//   priorillness_name: "",
// };

// export default function PriorIllnessPage({ priorIllnesses = [] }: PriorIllnessProps) {
//   const { props } = usePage() as { props: { success?: string; errors?: Record<string, string>; auth?: { user?: { role?: string } } } };

//   useEffect(() => {
//     if (props.success) alert(props.success);
//   }, [props.success]);

//   // choose Sidebar/Header based on role (like KnowledgeBasePage)
//   const role = props.auth?.user?.role ?? "admin";
//   const SidebarComponent = role === "doctor" ? SidebarDoctor : SidebarAdmin;
//   const HeaderComponent = role === "doctor" ? HeaderDoctor : HeaderAdmin;

//   // UI state
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingIndex, setEditingIndex] = useState<number | null>(null);
//   const [menuOpenIndex, setMenuOpenIndex] = useState<number | null>(null);

//   // pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);

//   // form state & errors
//   const [form, setForm] = useState<PriorIllness>({ ...emptyItem });
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   // Filtered + paginated
//   const filtered = useMemo(
//     () =>
//       priorIllnesses.filter((i) =>
//         i.priorillness_name.toLowerCase().includes(search.toLowerCase())
//       ),
//     [priorIllnesses, search]
//   );
//   const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
//   const start = (currentPage - 1) * itemsPerPage;
//   const currentItems = filtered.slice(start, start + itemsPerPage);

//   // handlers
//   function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
//     const { name, value } = e.target;
//     setForm((f) => ({ ...f, [name]: value }));
//   }

//   function openAddModal() {
//     setEditingIndex(null);
//     setForm({ ...emptyItem });
//     setIsModalOpen(true);
//     setMenuOpenIndex(null);
//     setErrors({});
//   }

//   function openEditModal(indexInPage: number) {
//     const realIndex = start + indexInPage;
//     const item = filtered[realIndex];
//     if (!item) return;
//     setEditingIndex(realIndex);
//     setForm({
//       id: item.id,
//       priorillness_name: item.priorillness_name || "",
//     });
//     setIsModalOpen(true);
//     setMenuOpenIndex(null);
//     setErrors({});
//   }

//   function closeModal() {
//     setIsModalOpen(false);
//     setEditingIndex(null);
//     setForm({ ...emptyItem });
//     setErrors({});
//   }

//   function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     if (!form.priorillness_name || form.priorillness_name.trim().length < 2) {
//       setErrors({ priorillness_name: "Name is required (min 2 characters)." });
//       return;
//     }

//     if (editingIndex !== null) {
//       // Update existing record
//       const payload = {
//         priorillness_name: form.priorillness_name.trim(),
//         _method: "put",
//       };
//       router.post(`/editpriorillnesses/${form.id}`, payload, {
//         onSuccess: () => closeModal(),
//         onError: (errs: any) => setErrors(errs || {}),
//       });
//     } else {
//       // Create new record
//       router.post("/priorillnesses", { priorillness_name: form.priorillness_name.trim() }, {
//         onSuccess: () => {
//           closeModal();
//           setCurrentPage(1);
//         },
//         onError: (errs: any) => setErrors(errs || {}),
//       });
//     }
//   }

//   return (
//     <div className="flex min-h-screen bg-blue-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200 relative transition-colors duration-300">
//       {/* Sidebar (desktop) */}
//       <aside className="hidden sm:block fixed inset-y-0 left-0 w-64 z-40 bg-white dark:bg-gray-800 shadow-lg">
//         <SidebarComponent />
//       </aside>

//       {/* Mobile hamburger */}
//       <div className="sm:hidden fixed top-4 left-4 z-50">
//         <button
//           onClick={() => setSidebarOpen(!sidebarOpen)}
//           className="p-2 bg-white dark:bg-gray-700 rounded-full shadow"
//         >
//           <FaBars />
//         </button>
//       </div>

//       {/* Mobile overlay */}
//       {sidebarOpen && (
//         <div className="fixed inset-0 z-50 flex">
//           <div className="w-64 h-full bg-white dark:bg-gray-800 shadow-lg">
//             <SidebarComponent />
//           </div>
//           <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
//         </div>
//       )}

//       <main className="flex-1 sm:ml-64 p-6 w-full">
//         <HeaderComponent title="Manage Prior Illnesses" />

//         {/* Controls */}
//         <div className="bg-blue-100 dark:bg-gray-700 rounded-xl p-6 shadow-md mb-6">
//           <div className="flex justify-between items-center flex-wrap gap-4">
//             <button
//               onClick={openAddModal}
//               className="bg-blue-700 dark:bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-blue-800 dark:hover:bg-blue-950"
//             >
//               <FaPlus /> ADD PRIOR ILLNESS
//             </button>
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 value={search}
//                 onChange={(e) => {
//                   setSearch(e.target.value);
//                   setCurrentPage(1);
//                 }}
//                 className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
//               />
//               <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//             </div>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-blue-300 dark:border-gray-700 overflow-auto">
//           <table className="w-full text-sm sm:text-base border-collapse">
//             <thead>
//               <tr className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
//                 <th className="px-3 py-2 text-left">Prior Illness Name</th>
//                 <th className="px-3 py-2 text-left">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentItems.length === 0 ? (
//                 <tr>
//                   <td colSpan={2} className="px-3 py-6 text-center text-gray-500">
//                     No records found.
//                   </td>
//                 </tr>
//               ) : (
//                 currentItems.map((item, idx) => {
//                   const realIndex = start + idx;
//                   return (
//                     <tr
//                       key={item.id}
//                       className="border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition"
//                     >
//                       <td className="px-3 py-2">{item.priorillness_name}</td>
//                       <td className="px-3 py-2">
//                         <button
//                           onClick={() => openEditModal(idx)}
//                           className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
//                         >
//                           Edit
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>

//           {/* Pagination */}
//           <div className="flex justify-between items-center mt-4 text-sm flex-wrap gap-2">
//             <div className="flex items-center gap-2">
//               <span>Display</span>
//               <select
//                 value={itemsPerPage}
//                 onChange={(e) => {
//                   setItemsPerPage(Number(e.target.value));
//                   setCurrentPage(1);
//                 }}
//                 className="border border-gray-300 rounded px-2 py-1 bg-white dark:bg-gray-800"
//               >
//                 {[10, 25, 50].map((opt) => (
//                   <option key={opt} value={opt}>{opt}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//                 disabled={currentPage === 1}
//                 className="px-2 py-1 border rounded disabled:opacity-50"
//               >
//                 &lt;
//               </button>
//               {[...Array(totalPages)].map((_, i) => (
//                 <button
//                   key={i}
//                   onClick={() => setCurrentPage(i + 1)}
//                   className={`px-3 py-1 rounded ${
//                     currentPage === i + 1
//                       ? "bg-red-500 text-white"
//                       : "border border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
//                   }`}
//                 >
//                   {i + 1}
//                 </button>
//               ))}
//               <button
//                 onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
//                 disabled={currentPage === totalPages}
//                 className="px-2 py-1 border rounded disabled:opacity-50"
//               >
//                 &gt;
//               </button>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Add/Edit Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
//           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl p-6 space-y-6">
//             <h2 className="text-xl font-semibold">
//               {editingIndex !== null ? "Edit Prior Illness" : "Add Prior Illness"}
//             </h2>

//             <form onSubmit={handleSubmit}>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-4">
//                   <input
//                     name="priorillness_name"
//                     placeholder="Prior illness name"
//                     value={form.priorillness_name}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
//                     required
//                   />
//                   {errors.priorillness_name && (
//                     <p className="text-red-500 text-xs">{errors.priorillness_name}</p>
//                   )}
//                 </div>
//                 <div className="space-y-4">
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     Names must be unique.
//                   </p>
//                 </div>
//               </div>

//               <div className="flex justify-end gap-4 mt-4">
//                 <button
//                   type="button"
//                   onClick={closeModal}
//                   className="px-6 py-2 rounded-lg border border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-6 py-2 rounded-lg bg-blue-600 dark:bg-blue-900 text-white hover:bg-blue-700 dark:hover:bg-blue-950"
//                 >
//                   {editingIndex !== null ? "Update" : "Add"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


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

interface PriorIllness {
  id: number;
  priorillness_name: string;
  disease?: Disease;
}

interface PriorIllnessProps {
  priorIllnesses: PriorIllness[];
}

const emptyItem: PriorIllness = {
  id: 0,
  priorillness_name: "",
};

export default function PriorIllnessPage({ priorIllnesses = [] }: PriorIllnessProps) {
  const { props } = usePage() as { props: { success?: string; errors?: Record<string, string>; auth?: { user?: { role?: string } } } };

  useEffect(() => {
    if (props.success) alert(props.success);
  }, [props.success]);

  // choose Sidebar/Header based on role
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
  const [form, setForm] = useState<PriorIllness>({ ...emptyItem });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filtered + paginated - includes disease name in search
  const filtered = useMemo(
    () =>
      priorIllnesses.filter((i) =>
        i.priorillness_name.toLowerCase().includes(search.toLowerCase()) ||
        (i.disease?.disease_name && i.disease.disease_name.toLowerCase().includes(search.toLowerCase()))
      ),
    [priorIllnesses, search]
  );
  
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const start = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(start, start + itemsPerPage);

  // handlers
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function openAddModal() {
    setEditingIndex(null);
    setForm({ ...emptyItem });
    setIsModalOpen(true);
    setMenuOpenIndex(null);
    setErrors({});
  }

  function openEditModal(indexInPage: number) {
    const realIndex = start + indexInPage;
    const item = filtered[realIndex];
    if (!item) return;
    setEditingIndex(realIndex);
    setForm({
      id: item.id,
      priorillness_name: item.priorillness_name || "",
    });
    setIsModalOpen(true);
    setMenuOpenIndex(null);
    setErrors({});
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingIndex(null);
    setForm({ ...emptyItem });
    setErrors({});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.priorillness_name || form.priorillness_name.trim().length < 2) {
      setErrors({ priorillness_name: "Name is required (min 2 characters)." });
      return;
    }

    if (editingIndex !== null) {
      // Update existing record
      const payload = {
        priorillness_name: form.priorillness_name.trim(),
        _method: "put",
      };
      router.post(`/editpriorillnesses/${form.id}`, payload, {
        onSuccess: () => closeModal(),
        onError: (errs: any) => setErrors(errs || {}),
      });
    } else {
      // Create new record
      router.post("/priorillnesses", { priorillness_name: form.priorillness_name.trim() }, {
        onSuccess: () => {
          closeModal();
          setCurrentPage(1);
        },
        onError: (errs: any) => setErrors(errs || {}),
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
        >
          <FaBars />
        </button>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 h-full bg-white dark:bg-gray-800 shadow-lg">
            <SidebarComponent />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <main className="flex-1 sm:ml-64 p-6 w-full">
        <HeaderComponent title="Manage Prior Illnesses" />

        {/* Controls */}
        <div className="bg-blue-100 dark:bg-gray-700 rounded-xl p-6 shadow-md mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <button
              onClick={openAddModal}
              className="bg-blue-700 dark:bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-blue-800 dark:hover:bg-blue-950"
            >
              <FaPlus /> ADD PRIOR ILLNESS
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-blue-300 dark:border-gray-700 overflow-auto">
          <table className="w-full text-sm sm:text-base border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
                <th className="px-3 py-2 text-left">Prior Illness Name</th>
                <th className="px-3 py-2 text-left">Disease Name</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-gray-500">
                    No records found.
                  </td>
                </tr>
              ) : (
                currentItems.map((item, idx) => {
                  const realIndex = start + idx;
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="px-3 py-2">{item.priorillness_name}</td>
                      <td className="px-3 py-2">{item.disease?.disease_name || '-'}</td>
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
          <div className="flex justify-between items-center mt-4 text-sm flex-wrap gap-2">
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
                  <option key={opt} value={opt}>{opt}</option>
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
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1
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
            <h2 className="text-xl font-semibold">
              {editingIndex !== null ? "Edit Prior Illness" : "Add Prior Illness"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <input
                    name="priorillness_name"
                    placeholder="Prior illness name"
                    value={form.priorillness_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                    required
                  />
                  {errors.priorillness_name && (
                    <p className="text-red-500 text-xs">{errors.priorillness_name}</p>
                  )}
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Names must be unique.
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