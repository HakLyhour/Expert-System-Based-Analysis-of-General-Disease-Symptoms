import React from "react";
import { usePage, router } from "@inertiajs/react";

type AltPrediction = {
  disease: string;
  confidence: number;
};

type Diagnosis = {
  id: number;
  disease: { diseases_name: string };
  confidence_score?: number | null;
  symptoms: { name: string }[];
  priorillnesses: { priorillness_name: string }[];
  treatments: { description: string }[];
  alternatives?: AltPrediction[]; // 👈 ML API top-3 predictions
};

export default function ResultsPage() {
  const { props } = usePage() as { props: { diagnosis: Diagnosis } };
  const diag = props.diagnosis;

  return (
    <div className="flex min-h-screen bg-blue-50 dark:bg-gray-900">
      <div className="flex-1 p-6 sm:p-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <button onClick={() => router.get("/welcome")}>
            <img src={"/assets/logo.jpg"} alt="PiKrous Logo" className="h-12" />
          </button>
          <button
            onClick={() => router.get("/symptom-form")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Start Over
          </button>
        </header>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-10 shadow space-y-6">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-300 text-center">
            Diagnosis Summary
          </h1>

          {/* Symptoms */}
          <div>
            <h2 className="font-semibold">Selected Symptoms:</h2>
            {diag.symptoms?.length ? (
              <ul className="list-disc list-inside">
                {diag.symptoms.map((s, i) => (
                  <li key={i}>{s.name}</li>
                ))}
              </ul>
            ) : (
              <p>None</p>
            )}
          </div>

          {/* Prior Illnesses */}
          <div>
            <h2 className="font-semibold">Prior Illnesses:</h2>
            {diag.priorillnesses?.length ? (
              <ul className="list-disc list-inside">
                {diag.priorillnesses.map((p, i) => (
                  <li key={i}>{p.priorillness_name}</li>
                ))}
              </ul>
            ) : (
              <p>None</p>
            )}
          </div>

          {/* Main Prediction */}
          <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-md text-blue-900 dark:text-blue-100">
            <p>
              Based on your inputs, you may be experiencing{" "}
              <strong>{diag.disease?.diseases_name ?? "Unknown"}</strong>.
              <br />
              Confidence:{" "}
              {diag.confidence_score != null
                ? `${(diag.confidence_score * 100).toFixed(0)}%`
                : "N/A"}
            </p>
          </div>

          {/* Alternatives (Top-3) */}
          {diag.alternatives && diag.alternatives.length > 1 && (
            <div>
              <h2 className="font-semibold">Other Possible Diseases:</h2>
              <ul className="list-disc list-inside">
                {diag.alternatives.slice(1).map((alt, i) => (
                  <li key={i}>
                    {alt.disease} — {(alt.confidence * 100).toFixed(0)}%
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Treatments */}
          <div>
            <h2 className="font-semibold">Recommended Treatments:</h2>
            {diag.treatments?.length ? (
              <ul className="list-disc list-inside">
                {diag.treatments.map((t, i) => (
                  <li key={i}>{t.description}</li>
                ))}
              </ul>
            ) : (
              <p>No treatments found for this disease.</p>
            )}
          </div>

          <p className="text-xs opacity-70">
            <em>This is not medical advice; consult a licensed provider.</em>
          </p>
        </div>
      </div>
    </div>
  );
}
