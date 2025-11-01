import React, { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import Sidebar from "../../Layouts/SidebarAdmin";
import Header from "../../Layouts/HeaderAdmin";
import { FaPlus, FaSearch, FaBars, FaEyeSlash, FaEye } from "react-icons/fa";


interface Doctor {
  id: number;
  user_name: string;
  date_of_birth: string;
  gender: string;
  image: string | File; // can be a string (URL) or File object
  email: string;
  password?: string;
  password_confirmation?: string;
  role: string;
  weight: string;
  height: string;
}

interface ListDoctorProps {
  doctors: Doctor[];
}

export default function ListDoctor({ doctors = [] }: ListDoctorProps) {

  // ...inside component:
  const { props } = usePage();
  useEffect(() => {
    if (props.success) {
      alert(props.success); // or show a toast/modal
    }
  }, [props.success]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // For edit password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [viewDoctor, setViewDoctor] = useState<Doctor | null>(null);
  const [menuOpenIndex, setMenuOpenIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // For new doctor registration
  const emptyForm: Doctor = {
    id: 0,
    user_name: "",
    date_of_birth: "",
    gender: "",
    image: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "doctor",
    weight: "",
    height: "",
  };
  const [form, setForm] = useState<Doctor>({ ...emptyForm });

  // For Delete Modal
  /* const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null); */

  // Form handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("File is too large! Please select an image under 2MB.");
        return;
      }
      setForm((f) => ({ ...f, image: file })); // store the File object directly
    }
  };

  // Modal helpers
  const openAddModal = () => {
    setEditingIndex(null);
    setForm({ ...emptyForm });
    setIsModalOpen(true);
    setMenuOpenIndex(null);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // Open Edit Modal
  const openEditModal = (index: number) => {
  const doctor = filtered[index];
  setEditingIndex(index);
  setForm({
    id: doctor.id,
    user_name: doctor.user_name || "",
    date_of_birth: doctor.date_of_birth || "",
    gender: doctor.gender || "",
    email: doctor.email || "",
    weight: doctor.weight || "",
    height: doctor.height || "",
    image: "", // reset to allow re-upload
    password: "",
    password_confirmation: "",
    role: doctor.role || "doctor",
  });
  setIsModalOpen(true);
};

  const openViewModal = (index: number) => {
    setViewDoctor(filtered[index]);
    setIsViewOpen(true);
    setMenuOpenIndex(null);
  };
  /* const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
    setMenuOpenIndex(null);
  };
  const confirmDelete = () => {
    if (deleteId !== null) {
      router.delete(`/listdoctor/${deleteId}`);
      setDeleteId(null);
      setShowDeleteModal(false);
    }
  }; */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIndex !== null) {
      // Edit mode: update doctor
      const doctorId = filtered[editingIndex].id;
      const editPayload: any = {
        ...form,
        _method: "put",
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      };
      router.post(`/listdoctor/${doctorId}`, editPayload, {
        forceFormData: true,
        onSuccess: () => {
          setIsModalOpen(false);
          setEditingIndex(null);
          setForm({ ...emptyForm });
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: (errors) => setErrors(errors),
      });
    } else {
      // Add mode: create doctor
      router.post("/listdoctor", form as any, {
        forceFormData: true, // tells Inertia to send as multipart/form-data
        onSuccess: () => {
          if (window.confirm('Account created successfully! Click OK to go to Doctor List.')) {
          }
          setIsModalOpen(false);
          setForm({ ...emptyForm });
        },
        onError: (errors) => setErrors(errors),
      });
    }
  };

  // Filter and paginate doctors
  const filtered = doctors.filter((d) =>
    d.user_name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const currentDoctors = filtered.slice(start, start + itemsPerPage);

  return (
    <div className="flex min-h-screen bg-blue-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200 relative transition-colors duration-300">
      {/* Sidebar */}
      <aside className="hidden sm:block fixed inset-y-0 left-0 w-64 z-40 bg-white dark:bg-gray-800 shadow-lg">
        <Sidebar />
      </aside>
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
          <div
            className="flex-1 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main */}
      <main className="flex-1 sm:ml-64 p-6 w-full">
        <Header title="Doctors" />

        {/* Controls */}
        <div className="bg-blue-100 dark:bg-gray-700 rounded-xl p-6 shadow-md mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <button
              onClick={openAddModal}
              className="bg-blue-700 dark:bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-blue-800 dark:hover:bg-blue-950"
            >
              <FaPlus /> ADD NEW
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
                <th className="px-3 py-2 text-left">Img</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">DOB</th>
                <th className="px-3 py-2 text-left">Gender</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Weight</th>
                <th className="px-3 py-2 text-left">Height</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentDoctors.map((d, idx) => {
                const realIndex = start + idx;
                return (
                  <tr
                    key={d.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="px-3 py-2">
                      <img
                        src={
                          typeof d.image === "string" && d.image
                            ? (
                              d.image.startsWith("users/") ||
                                d.image.startsWith("/storage/users/")
                                ? `/storage/${d.image.replace(/^\/?storage\//, "")}`
                                : `/assets/${d.image}`
                            )
                            : "/assets/doctor.png"
                        }
                        alt={d.user_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />

                    </td>
                    <td className="px-3 py-2">{d.user_name}</td>
                    <td className="px-3 py-2">{d.date_of_birth}</td>
                    <td className="px-3 py-2">{d.gender}</td>
                    <td className="px-3 py-2">{d.email}</td>
                    <td className="px-3 py-2">{d.weight}</td>
                    <td className="px-3 py-2">{d.height}</td>
                    <td className="px-3 py-2 relative">
                      <button
                        onClick={() =>
                          setMenuOpenIndex(menuOpenIndex === realIndex ? null : realIndex)
                        }
                        className="text-xl text-gray-600 hover:text-gray-800"
                      >
                        ⋯
                      </button>
                      {menuOpenIndex === realIndex && (
                        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
                          <button
                            onClick={() => openViewModal(realIndex)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-900"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => openEditModal(realIndex)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-900"
                          >
                            Edit
                          </button>
                          {/* <button
                            onClick={() => handleDelete(d.id)}
                            className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-900"
                          >
                            Delete
                          </button> */}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Add Doctor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {editingIndex !== null ? "Edit Doctor" : "Add New Doctor"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <input name="user_name" placeholder="Name" value={form.user_name} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" required />
                  <input name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" required />
                  <select name="gender" value={form.gender} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-gray-200">
                    <option value="" disabled>
                      Select Gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" required />

                  {/* Password fields for Add Doctor */}
                  {editingIndex === null && (
                    <>
                      {/* Password Field */}
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          id="password"
                          placeholder="Password"
                          value={form.password}
                          onChange={handleChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 pr-12 text-base"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-5 -translate-y-1/2 dark:text-gray-200 p-1 rounded-full focus:outline-none"
                        >
                          {showPassword ? <FaEye size={18}/> : <FaEyeSlash size={18}/>}
                        </button>
                        <p className="text-xs dark:text-gray-200 pt-1">
                          Must be 8+ characters with number, symbol, upper and lower case.
                        </p>
                        {errors.password && (
                          <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.password}</p>
                        )}
                      </div>
                      {/* Confirm Password Field */}
                      <div className="relative">
                        <input
                          type={showConfirm ? "text" : "password"}
                          name="password_confirmation"
                          id="password_confirmation"
                          placeholder="Confirm Password"
                          value={form.password_confirmation}
                          onChange={handleChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 pr-12 text-base"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2  dark:text-gray-200 p-1 rounded-full focus:outline-none"
                        >
                          {showConfirm ? <FaEye size={18}/> : <FaEyeSlash size={18}/>}
                        </button>
                        {errors.password_confirmation && (
                          <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.password_confirmation}</p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Change Password fields for Edit Doctor */}
                  {editingIndex !== null && (
                    <div className="space-y-4 mt-6">
                      <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300 mb-2">Change Password</h3>
                      {/* Current Password */}
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Current Password"
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 pr-12 text-base"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-gray-200 p-1 rounded-full focus:outline-none"
                          tabIndex={-1}
                        >
                          {showCurrentPassword ? <FaEye size={18}/> : <FaEyeSlash size={18}/>}
                        </button>
                        {errors.current_password && (
                          <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.current_password}</p>
                        )}
                      </div>
                      {/* New Password */}
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="New Password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 pr-12 text-base"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-gray-200 p-1 rounded-full focus:outline-none"
                          tabIndex={-1}
                        >
                          {showNewPassword ? <FaEye size={18}/> : <FaEyeSlash size={18}/>}
                        </button>
                        <p className="text-xs dark:text-gray-200 pt-1">
                          Must be 8+ characters with number, symbol, upper and lower case.
                        </p>
                        {errors.password && (
                          <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.password}</p>
                        )}
                      </div>
                      {/* Confirm New Password */}
                      <div className="relative">
                        <input
                          type={showEditConfirmPassword ? "text" : "password"}
                          placeholder="Confirm New Password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 pr-12 text-base"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEditConfirmPassword(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-gray-200 p-1 rounded-full focus:outline-none"
                          tabIndex={-1}
                        >
                          {showEditConfirmPassword ? <FaEye size={18}/> : <FaEyeSlash size={18}/>}
                        </button>
                        {errors.password_confirmation && (
                          <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.password_confirmation}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 border border-gray-300 dark:border-gray-600 rounded-full overflow-hidden flex items-center justify-center">
                    {form.image ? (
                      <img
                        src={
                          typeof form.image === "string" && form.image
                            ? (
                              form.image.startsWith("users/") ||
                                form.image.startsWith("/storage/users/")
                                ? `/storage/${form.image.replace(/^\/?storage\//, "")}`
                                : `/assets/${form.image}`
                            )
                            : "/assets/doctor.png"
                        }
                        alt="Preview"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="text-gray-400">No Image</div>
                    )}

                  </div>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="upload-avatar" />
                  <label htmlFor="upload-avatar" className="bg-blue-600 dark:bg-blue-900 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 dark:hover:bg-blue-950 text-sm">
                    Upload
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Large images will be automatically resized to 300x300px and compressed.
                  </p>
                  <input name="weight" placeholder="Weight (kg)" value={form.weight} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" required />
                  <input name="height" placeholder="Height (cm)" value={form.height} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" required />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg border border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 dark:bg-blue-900 text-white hover:bg-blue-700 dark:hover:bg-blue-950">
                  {editingIndex !== null ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewOpen && viewDoctor && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Doctor Details</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <img
                  src={
                    typeof viewDoctor.image === "string" && viewDoctor.image
                      ? (
                        viewDoctor.image.startsWith("users/") ||
                          viewDoctor.image.startsWith("/storage/users/")
                          ? `/storage/${viewDoctor.image.replace(/^\/?storage\//, "")}`
                          : `/assets/${viewDoctor.image}`
                      )
                      : "/assets/doctor.png"
                  }
                  alt={viewDoctor.user_name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{viewDoctor.user_name}</p>
                </div>
              </div>
              <p>
                <strong>Date of Birth:</strong> {viewDoctor.date_of_birth}
              </p>
              <p>
                <strong>Gender:</strong> {viewDoctor.gender}
              </p>
              <p>
                <strong>Email:</strong> {viewDoctor.email}
              </p>
              <p>
                <strong>Weight:</strong> {viewDoctor.weight} kg
              </p>
              <p>
                <strong>Height:</strong> {viewDoctor.height} cm
              </p>
              <p>
                <strong>Role:</strong> {viewDoctor.role}
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {/* {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
              Confirm Delete
            </h2>
            <p className="text-sm mb-6 text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this doctor?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
