import React from "react";
import { router } from "@inertiajs/react";
import { BiUndo } from "react-icons/bi";


const HowToUsePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-6 sm:p-10 transition-colors">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <img
            src="/assets/logo.jpg"
            alt="Logo"
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">
            How to Use PiKrous
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            Quick guide to using our core features for health diagnosis.
          </p>
        </div>

        {/* Key Features */}
        <div className="space-y-8">
          {/* 1. Health Diagnosis */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
              1. Health Diagnosis
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              From the homepage or dashboard, click on{" "}
              <strong>"Health Diagnosis"</strong> to begin. You'll be guided
              through a set of questions to help identify possible conditions
              based on your symptoms.
            </p>
          </div>

          {/* 2. Health Roadmap (renamed from Advice) */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
              2. Health Roadmap
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Use the <strong>"Health Roadmap"</strong> section to explore a
              disease’s background, symptoms, severity, and solutions. This helps
              you understand how it impacts different age groups and what steps
              to take.
            </p>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => router.get("/")}
            className="w-22 h-12 flex items-center justify-center gap-2 bg-blue-600 dark:bg-blue-900 hover:bg-blue-700 dark:hover:bg-blue-950 text-white rounded-xl shadow-lg transition duration-200"
            title="Back to Dashboard"
          >
            <BiUndo className="text-2xl" />
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowToUsePage;

