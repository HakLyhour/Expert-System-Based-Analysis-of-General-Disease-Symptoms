// import React, { useEffect, useState } from "react";
// import { router, usePage } from "@inertiajs/react";
// import { BiUndo } from "react-icons/bi";
// import Select, { MultiValue } from "react-select";

// // Props from backend
// type SymptomPageProps = {
//     symptoms: string[];
//     priorIllnesses: string[];
// };

// // Stronger typing for form data
// type FormDataType = {
//     ageRange?: string;
//     weight?: string;
//     mainSymptom?: string[];
//     priorIllnesses?: string[];
// };

// type Diagnosis = { prediction: string; confidence?: number };

// export default function SymptomFormPage({ symptoms = [], priorIllnesses = [] }: SymptomPageProps) {
//     const { props } = usePage() as {
//         props: { diagnosis?: Diagnosis; inputSymptoms?: string[]; errors?: Record<string, string> };
//     };

//     const [step, setStep] = useState<number>(1);
//     const [formData, setFormData] = useState<FormDataType>({});
//     const [sidebarOpen, setSidebarOpen] = useState(true);
//     const isLoggedIn = !!localStorage.getItem("auth_token");

//     const handleChange = (id: keyof FormDataType, value: any) =>
//         setFormData((prev) => ({ ...prev, [id]: value }));

//     const handleNext = () => {
//         if (!formData.ageRange || !formData.weight) {
//             window.alert("Please fill in both your age range and weight before proceeding.");
//             return;
//         }
//         setStep(2);
//     };

//     const handleSubmit = () => {
//         if (!formData.mainSymptom || formData.mainSymptom.length === 0) {
//             window.alert("Please select at least one symptom before submitting.");
//             return;
//         }
//         router.post("/diagnose", {
//             ageRange: formData.ageRange || "",
//             weight: formData.weight || "",
//             mainSymptom: formData.mainSymptom || [],
//             priorIllnesses: formData.priorIllnesses || []
//         });
//     };

//     const resetForm = () => {
//         setFormData({});
//         setStep(1);
//         localStorage.removeItem("symptomForm");
//     };

//     return (
//         <div className="relative min-h-screen bg-blue-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
//             <main className={`pt-20 px-4 pb-12 flex justify-center ${sidebarOpen && isLoggedIn ? "md:mr-64" : ""}`}>
//                 <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 sm:p-12 border-2 dark:border-gray-600">
//                     <h1 className="text-3xl font-semibold text-blue-600 text-center">Health Information</h1>
//                     <div className="flex justify-end mt-4">
//                         <span className="text-sm text-gray-400">Page: {step}/2</span>
//                     </div>

//                     {/* ML Diagnosis Result */}
//                     {props.diagnosis && (
//                         <div
//                             className={`mt-6 p-4 rounded-lg ${
//                                 props.diagnosis.prediction ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"
//                             }`}
//                         >
//                             <div className="font-semibold text-lg mb-1">Diagnosis Result</div>
//                             <div>
//                                 <span className="font-medium">Prediction:</span> {props.diagnosis.prediction}
//                             </div>
//                             {props.diagnosis.confidence != null && (
//                                 <div>
//                                     <span className="font-medium">Confidence:</span>{" "}
//                                     {(props.diagnosis.confidence * 100).toFixed(2)}%
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {/* Step 1: Age + Weight */}
//                     {step === 1 && (
//                         <>
//                             {/* Age Range */}
//                             <div className="mt-6">
//                                 <div className="px-3 py-2 border:none text-blue-600 bg-white dark:bg-gray-700 mb-2">
//                                     What is your age range? <span className="text-red-500">*</span>
//                                 </div>
//                                 <select
//                                     value={formData.ageRange || ""}
//                                     onChange={(e) => handleChange("ageRange", e.target.value)}
//                                     className="w-full px-3 py-2 border rounded-lg mb-2"
//                                 >
//                                     <option value="">Select your age range</option>
//                                     <option value="0-18">0-18</option>
//                                     <option value="19-30">19-30</option>
//                                     <option value="31-45">31-45</option>
//                                     <option value="46-60">46-60</option>
//                                     <option value="61+">61+</option>
//                                 </select>
//                             </div>

//                             {/* Weight */}
//                             <div className="mt-6">
//                                 <div className="px-3 py-2 border:none text-blue-600 bg-white dark:bg-gray-700 mb-2">
//                                     What is your weight? <span className="text-red-500">*</span>
//                                 </div>
//                                 <div className="relative mt-3">
//                                     <input
//                                         type="number"
//                                         value={formData.weight || ""}
//                                         onChange={(e) => handleChange("weight", e.target.value)}
//                                         min={1}
//                                         step={0.1}
//                                         className="w-full pr-12 px-3 py-2 border rounded-lg mb-2"
//                                     />
//                                     <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
//                                         kg
//                                     </span>
//                                 </div>
//                             </div>
//                         </>
//                     )}

//                     {/* Step 2: Symptoms + Prior Illnesses */}
//                     {step === 2 && (
//                         <>
//                             {/* Main Symptom */}
//                             <div className="mt-6">
//                                 <div className="px-3 py-2 border:none text-blue-600 bg-white dark:bg-gray-700 mb-2">
//                                     What is your main symptom? <span className="text-red-500">*</span>
//                                 </div>
//                                 <Select
//                                     isMulti
//                                     isSearchable
//                                     closeMenuOnSelect={false}
//                                     options={symptoms.map((s) => ({ value: s, label: s }))}
//                                     value={(formData.mainSymptom || []).map((s) => ({ value: s, label: s }))}
//                                     onChange={(val: MultiValue<{ value: string; label: string }>) =>
//                                         handleChange(
//                                             "mainSymptom",
//                                             val.map((v) => v.value)
//                                         )
//                                     }
//                                     placeholder="Select your main symptom"
//                                     className="react-select-container"
//                                     classNamePrefix="react-select"
//                                 />
//                             </div>

//                             {/* Prior Illnesses */}
//                             <div className="mt-6">
//                                 <div className="px-3 py-2 border:none text-blue-600 bg-white dark:bg-gray-700 mb-2">
//                                     Which prior illnesses have you had?
//                                 </div>
//                                 <Select
//                                     isMulti
//                                     isSearchable
//                                     closeMenuOnSelect={false}
//                                     options={[
//                                         { value: "None", label: "None" },
//                                         ...priorIllnesses.map((ill) => ({
//                                             value: ill,
//                                             label: ill
//                                         }))
//                                     ]}
//                                     value={(formData.priorIllnesses || []).map((s) => ({ value: s, label: s }))}
//                                     onChange={(val: MultiValue<{ value: string; label: string }>) => {
//                                         let values = val.map((v) => v.value);
//                                         if (values.includes("None")) {
//                                             values = ["None"];
//                                         } else {
//                                             values = values.filter((v) => v !== "None");
//                                         }
//                                         handleChange("priorIllnesses", values);
//                                     }}
//                                     placeholder="Select prior illnesses"
//                                     className="react-select-container"
//                                     classNamePrefix="react-select"
//                                 />
//                             </div>
//                         </>
//                     )}

//                     {/* Navigation Buttons */}
//                     <div className="mt-8 flex justify-between">
//                         {step === 1 ? (
//                             <button
//                                 onClick={() => router.get("/")}
//                                 className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg"
//                             >
//                                 <BiUndo />
//                                 Back
//                             </button>
//                         ) : (
//                             <button
//                                 onClick={() => setStep(1)}
//                                 className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg"
//                             >
//                                 <BiUndo />
//                                 Back
//                             </button>
//                         )}
//                         <button
//                             onClick={step === 1 ? handleNext : handleSubmit}
//                             className="px-6 py-2 bg-blue-600 text-white rounded-lg"
//                         >
//                             {step === 1 ? "Next" : "Submit"}
//                         </button>
//                     </div>

//                     <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
//                         PiKrous can be wrong, please double check!
//                     </p>
//                 </div>
//             </main>
//         </div>
//     );
// }



import React, { useEffect, useMemo, useRef, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { BiUndo } from "react-icons/bi";
import Select, {
  MultiValue,
  components,
  MenuListProps,
  GroupBase,
} from "react-select";

/* ---------- Shared option type for react-select ---------- */
type OptionType = { value: string; label: string };

// Props from backend
type SymptomPageProps = {
  symptoms: string[];
  priorIllnesses: string[];
};

// Stronger typing for form data
type FormDataType = {
  ageRange?: string;
  weight?: string;
  mainSymptom?: string[];
  priorIllnesses?: string[];
};

type Diagnosis = { prediction: string; confidence?: number };

/* -------------------- Helpers for recommendations -------------------- */
function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3);
}

function jaccard(a: Set<string>, b: Set<string>): number {
  const inter = new Set([...a].filter((x) => b.has(x))).size;
  const union = new Set([...a, ...b]).size || 1;
  return inter / union;
}

function buildTokenIndex(allSymptoms: string[]) {
  const idx = new Map<string, Set<string>>();
  for (const s of allSymptoms) {
    for (const t of tokenize(s)) {
      if (!idx.has(t)) idx.set(t, new Set<string>());
      idx.get(t)!.add(s);
    }
  }
  return idx;
}

function recommendSymptoms(
  selected: string[],
  allSymptoms: string[],
  n = 5
): string[] {
  if (allSymptoms.length === 0) return [];

  const selectedSet = new Set(selected);
  const tokenIdx = buildTokenIndex(allSymptoms);

  const overlapScores = new Map<string, number>();
  for (const sel of selected) {
    const toks = new Set(tokenize(sel));
    for (const t of toks) {
      const bucket = tokenIdx.get(t);
      if (!bucket) continue;
      for (const cand of bucket) {
        if (selectedSet.has(cand)) continue;
        overlapScores.set(cand, (overlapScores.get(cand) || 0) + 1);
      }
    }
  }

  const byOverlap = [...overlapScores.entries()]
    .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]))
    .map(([s]) => s);

  let result = byOverlap.slice(0, n);
  if (result.length < n) {
    const seed = selected[selected.length - 1] || selected[0] || "";
    const seedTokens = new Set(tokenize(seed));
    const remainingPool = allSymptoms.filter(
      (s) => !selectedSet.has(s) && !result.includes(s)
    );
    const byJaccard = remainingPool
      .map((s) => [s, jaccard(seedTokens, new Set(tokenize(s)))] as const)
      .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]))
      .map(([s]) => s);

    result = result.concat(byJaccard).slice(0, n);
  }

  if (result.length < n) {
    const pad = allSymptoms.filter(
      (s) => !selectedSet.has(s) && !result.includes(s)
    );
    result = result.concat(pad).slice(0, n);
  }

  return result;
}

/* -------- Custom MenuList: force dropdown to scroll to top on change -------- */
const ScrollToTopMenuList = (
  props: MenuListProps<OptionType, true, GroupBase<OptionType>>
) => {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [props.selectProps.value]); // value is MultiValue<OptionType>

  return (
    <components.MenuList
      {...props}
      innerRef={(ref: HTMLDivElement | null) => {
        listRef.current = ref;
      }}
    />
  );
};

/* -------------------- Page Component -------------------- */
export default function SymptomFormPage({
  symptoms = [],
  priorIllnesses = [],
}: SymptomPageProps) {
  const { props } = usePage() as {
    props: { diagnosis?: Diagnosis; inputSymptoms?: string[]; errors?: Record<string, string> };
  };

  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormDataType>({});
  const [sidebarOpen] = useState(true);
  const isLoggedIn = !!localStorage.getItem("auth_token");

  const handleChange = (id: keyof FormDataType, value: any) =>
    setFormData((prev) => ({ ...prev, [id]: value }));

  const handleNext = () => {
    if (!formData.ageRange || !formData.weight) {
      window.alert("Please fill in both your age range and weight before proceeding.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = () => {
    if (!formData.mainSymptom || formData.mainSymptom.length === 0) {
      window.alert("Please select at least one symptom before submitting.");
      return;
    }
    router.post("/diagnose", {
      ageRange: formData.ageRange || "",
      weight: formData.weight || "",
      mainSymptom: formData.mainSymptom || [],
      priorIllnesses: formData.priorIllnesses || [],
    });
  };

  const recommended = useMemo(() => {
    const selected = formData.mainSymptom || [];
    if (selected.length === 0) return [] as string[];
    return recommendSymptoms(selected, symptoms, 5);
  }, [formData.mainSymptom, symptoms]);

  const symptomOptions: OptionType[] = useMemo(() => {
    const recSet = new Set(recommended);
    const recommendedOptions = recommended.map<OptionType>((s) => ({
      value: s,
      label: `${s} (Recommended)`,
    }));
    const nonRecommendedOptions = symptoms
      .filter((s) => !recSet.has(s))
      .map<OptionType>((s) => ({ value: s, label: s }));
    return [...recommendedOptions, ...nonRecommendedOptions];
  }, [recommended, symptoms]);

  return (
    <div className="relative min-h-screen bg-blue-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <main className={`pt-20 px-4 pb-12 flex justify-center ${sidebarOpen && isLoggedIn ? "md:mr-64" : ""}`}>
        <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 sm:p-12 border-2 dark:border-gray-600">
          <h1 className="text-3xl font-semibold text-blue-600 text-center">Health Information</h1>
          <div className="flex justify-end mt-4">
            <span className="text-sm text-gray-400">Page: {step}/2</span>
          </div>

          {/* ML Diagnosis Result */}
          {props.diagnosis && (
            <div
              className={`mt-6 p-4 rounded-lg ${
                props.diagnosis.prediction ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"
              }`}
            >
              <div className="font-semibold text-lg mb-1">Diagnosis Result</div>
              <div>
                <span className="font-medium">Prediction:</span> {props.diagnosis.prediction}
              </div>
              {props.diagnosis.confidence != null && (
                <div>
                  <span className="font-medium">Confidence:</span>{" "}
                  {(props.diagnosis.confidence * 100).toFixed(2)}%
                </div>
              )}
            </div>
          )}

          {/* Step 1: Age + Weight */}
          {step === 1 && (
            <>
              <div className="mt-6">
                <div className="px-3 py-2 text-blue-600 bg-white dark:bg-gray-700 mb-2">
                  What is your age range? <span className="text-red-500">*</span>
                </div>
                <select
                  value={formData.ageRange || ""}
                  onChange={(e) => handleChange("ageRange", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg mb-2"
                >
                  <option value="">Select your age range</option>
                  <option value="0-18">0-18</option>
                  <option value="19-30">19-30</option>
                  <option value="31-45">31-45</option>
                  <option value="46-60">46-60</option>
                  <option value="61+">61+</option>
                </select>
              </div>

              <div className="mt-6">
                <div className="px-3 py-2 text-blue-600 bg-white dark:bg-gray-700 mb-2">
                  What is your weight? <span className="text-red-500">*</span>
                </div>
                <div className="relative mt-3">
                  <input
                    type="number"
                    value={formData.weight || ""}
                    onChange={(e) => handleChange("weight", e.target.value)}
                    min={1}
                    step={0.1}
                    className="w-full pr-12 px-3 py-2 border rounded-lg mb-2"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">kg</span>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Symptoms + Prior Illnesses */}
          {step === 2 && (
            <>
              <div className="mt-6">
                <div className="px-3 py-2 text-blue-600 bg-white dark:bg-gray-700 mb-2">
                  What is your main symptom? <span className="text-red-500">*</span>
                </div>

                {/* IMPORTANT: Generics <OptionType, true> let TS know your option shape */}
                <Select<OptionType, true>
                  isMulti
                  isSearchable
                  closeMenuOnSelect={false}
                  options={symptomOptions}
                  value={(formData.mainSymptom || []).map<OptionType>((s) => ({
                    value: s,
                    label: recommended.includes(s) ? `${s} (Recommended)` : s,
                  }))}
                  onChange={(val: MultiValue<OptionType>) => {
                    handleChange(
                      "mainSymptom",
                      val.map((v) => v.value)
                    );
                  }}
                  placeholder="Select your main symptom"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  components={{ MenuList: ScrollToTopMenuList }}
                  styles={{
                    option: (base, state) => {
                      // TS now knows state.data is OptionType
                      const isRecommended =
                        typeof state.data.label === "string" &&
                        state.data.label.endsWith("(Recommended)");
                      return {
                        ...base,
                        backgroundColor: state.isSelected
                          ? "#2563eb"
                          : state.isFocused
                          ? "#e0e7ff"
                          : isRecommended
                          ? "#fef9c3"
                          : base.backgroundColor,
                        color: state.isSelected
                          ? "#fff"
                          : isRecommended
                          ? "#000000ff"
                          : base.color,
                        fontWeight: isRecommended ? 600 : (base as any).fontWeight,
                      };
                    },
                  }}
                />

                {formData.mainSymptom && formData.mainSymptom.length > 0 && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Tips: We put the <span className="font-medium">recommended</span> symptoms on top and mark them with “(Recommended)”.
                  </p>
                )}
              </div>

              <div className="mt-6">
                <div className="px-3 py-2 text-blue-600 bg-white dark:bg-gray-700 mb-2">
                  Which prior illnesses have you had?
                </div>
                <Select<OptionType, true>
                  isMulti
                  isSearchable
                  closeMenuOnSelect={false}
                  options={[
                    { value: "None", label: "None" },
                    ...priorIllnesses.map<OptionType>((ill) => ({
                      value: ill,
                      label: ill,
                    })),
                  ]}
                  value={(formData.priorIllnesses || []).map<OptionType>((s) => ({
                    value: s,
                    label: s,
                  }))}
                  onChange={(val: MultiValue<OptionType>) => {
                    let values = val.map((v) => v.value);
                    if (values.includes("None")) {
                      values = ["None"];
                    } else {
                      values = values.filter((v) => v !== "None");
                    }
                    handleChange("priorIllnesses", values);
                  }}
                  placeholder="Select prior illnesses"
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {step === 1 ? (
              <button
                onClick={() => router.get("/")}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg"
              >
                <BiUndo />
                Back
              </button>
            ) : (
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg"
              >
                <BiUndo />
                Back
              </button>
            )}
            <button
              onClick={step === 1 ? handleNext : handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg"
            >
              {step === 1 ? "Next" : "Submit"}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            PiKrous can be wrong, please double check!
          </p>
        </div>
      </main>
    </div>
  );
}
