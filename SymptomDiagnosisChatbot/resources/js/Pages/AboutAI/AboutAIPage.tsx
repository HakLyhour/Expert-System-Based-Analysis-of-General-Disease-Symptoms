import React from "react";

const AboutPage: React.FC = () => {
  return (
    <section className="bg-[#EEF6FE] dark:bg-gray-900 px-6 sm:px-10 md:px-55 py-24 min-h-screen transition-colors">
      {/* Title */}
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-blue-600 dark:text-blue-400 underline-offset-4 mb-16">
        Pikrus Purpose
      </h2>

      {/* Row 1: Text on Left, Image on Right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        <div>
          <p className="text-sm text-blue-800 dark:text-gray-200 leading-relaxed text-justify">
            The purpose of the <strong>Expert System-Based Analysis of General Disease Symptoms</strong> is to simulate
            a human doctor’s reasoning in diagnosing diseases. The AI collects raw symptom inputs from patients and processes
            them using a medical rule base to determine possible conditions. This system helps:
            <br />
            <br />
            - Speed up early disease detection. <br />
            - Assist rural or underserved areas. <br />
            - Reduce misdiagnosis from human error. <br />
            - Support doctors in clinical decision-making.
          </p>
        </div>
        <div className="flex items-center justify-center">
          <div className="p-4 bg-blue-100 dark:bg-gray-800 rounded-lg">
            <img
              src="/assets/questionicon.jpg"
              alt="Thinking Icon"
              className="w-32 sm:w-40 md:w-48 h-auto"
            />
          </div>
        </div>
      </div>

      {/* Row 2: Image on Left, Text on Right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="flex justify-center">
          <div className="p-4 bg-blue-100 dark:bg-gray-800 rounded-lg">
            <img
              src="/assets/sickicon.jpg"
              alt="Speaking Icon"
              className="w-32 sm:w-40 md:w-48 h-auto"
            />
          </div>
        </div>
        <div>
          <p className="text-sm text-blue-800 dark:text-gray-200 leading-relaxed text-justify">
            After the reasoning process, the AI communicates its diagnosis clearly to the user. It presents:
            <br />
            <br />
            - A possible condition based on symptoms. <br />
            - A confidence level or explanation. <br />
            - Suggested next actions such as consulting a specialist or undergoing tests.
            <br />
            <br />
            This approach improves trust in AI by making results easy to understand and useful for real medical decisions.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;