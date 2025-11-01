import React, { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { BiUndo, BiXCircle } from "react-icons/bi";

type Disease = {
  name: string;
  description: string;
  confidenceScore: number;
  symptoms: string[];
  treatment: string;
};
type PageProps = {
  diseases: Disease[];
};

const HealthRoadmap: React.FC = () => {
  const { props } = usePage<PageProps>();
  const diseases = props.diseases || [];
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(
    Math.min(10, diseases.length)
  );

  const filteredDiseases = diseases.filter((disease) =>
    disease.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dynamic rows per page options: 10, 20, 30, 40, ... up to filteredDiseases.length
  const baseOptions = [10, 20, 30, 40, 50, 100];
  const rowsPerPageOptions = baseOptions
    .filter(option => option <= filteredDiseases.length);
  if (
    filteredDiseases.length > 0 &&
    !rowsPerPageOptions.includes(filteredDiseases.length)
  ) {
    rowsPerPageOptions.push(filteredDiseases.length);
  }

  const totalPages = Math.ceil(filteredDiseases.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredDiseases.length);
  const displayedDiseases = filteredDiseases.slice(startIndex, endIndex);

  const handleSelect = (disease: Disease) => {
    if (selectedDisease?.name === disease.name) {
      setSelectedDisease(null);
    } else {
      setSelectedDisease(disease);
      setTimeout(() => {
        document.getElementById("disease-details")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors px-4 sm:px-8 py-10">
      {/* Search Input */}
      <div className="mb-6 flex flex-col sm:flex-row items-center gap-2">
        <div className="relative w-full sm:w-1/2">
          <input
            type="text"
            placeholder="Search disease..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm pr-10"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedDisease(null);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition"
              aria-label="Clear search"
            >
              <BiXCircle className="text-xl" />
            </button>
          )}
        </div>
      </div>

      {/* Disease List (Name Only) */}
      <section className="space-y-2">
        {displayedDiseases.length > 0 ? (
          displayedDiseases.map((disease, index) => (
            <button
              key={index}
              onClick={() => handleSelect(disease)}
              className={`w-full text-left rounded-lg px-4 py-3 transition-transform duration-200 ease-in-out border ${
                selectedDisease?.name === disease.name
                  ? "bg-blue-100 dark:bg-blue-900 border-blue-400 scale-[1.02]"
                  : "bg-white dark:bg-gray-800 border-blue-200 dark:border-gray-700 hover:scale-[1.01]"
              } shadow-sm hover:shadow-md`}
            >
              <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-300">
                {disease.name}
              </h2>
            </button>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No diseases found.
          </p>
        )}
      </section>

      {/* Pagination Bar */}
      {filteredDiseases.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Rows per page */}
          <div className="flex items-center gap-2 text-sm">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              {rowsPerPageOptions.map(option => (
                <option key={option} value={option}>
                  {option === filteredDiseases.length
                    ? `All (${filteredDiseases.length})`
                    : option}
                </option>
              ))}
            </select>
          </div>

          {/* Item Range and Arrows */}
          <div className="flex items-center gap-4 text-sm">
            <span>
              {startIndex + 1}–{endIndex} of {filteredDiseases.length}
            </span>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-2 py-1 rounded-md transition-colors duration-150 ${
                currentPage === 1
                  ? "text-gray-400 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                  : "text-blue-600 bg-white dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900"
              }`}
            >
              &laquo;
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-2 py-1 rounded-md transition-colors duration-150 ${
                currentPage === totalPages
                  ? "text-gray-400 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                  : "text-blue-600 bg-white dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900"
              }`}
            >
              &raquo;
            </button>
          </div>
        </div>
      )}

      {/* Selected Disease Details */}
      {selectedDisease && (
        <div
          id="disease-details"
          className="mt-8 bg-white dark:bg-gray-800 border border-blue-300 dark:border-gray-700 rounded-xl shadow-lg p-6 space-y-4"
        >
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-300">
            {selectedDisease.name}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {selectedDisease.description}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Confidence Score: {selectedDisease.confidenceScore}%
          </p>

          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 border-b pb-1 mb-2">
              Symptoms:
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {selectedDisease.symptoms.map((symptom, i) => (
                <li key={i}>{symptom}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 border-b pb-1 mb-2">
              Treatment:
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedDisease.treatment}
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={() => setSelectedDisease(null)}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="mt-10 text-center">
        <button
          onClick={() => router.get("/")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl shadow-lg transition-transform hover:scale-105 mx-auto"
        >
          <BiUndo className="text-xl" />
          Back
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-10 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-center text-gray-500 dark:text-gray-400">
        Information provided is for educational purposes only. Always consult a medical professional.
      </footer>
    </div>
  );
};

export default HealthRoadmap;