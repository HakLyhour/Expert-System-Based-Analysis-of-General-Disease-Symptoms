import React from "react";
import AboutUs from "../AboutUs/AboutUsPage";

const PrivacyPage: React.FC = () => {
  return (
    <>
      {/* Privacy & Policy Section */}
      <section
        id="privacy"
        className="bg-[#EEF6FE] dark:bg-gray-900 px-6 sm:px-10 md:px-20 py-24 min-h-screen transition-colors"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-blue-600 dark:text-blue-400 mb-12">
          Privacy &amp; Policy
        </h2>

        <div className="space-y-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section 1 */}
          <div>
            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-300 mb-3">
              Security Compliance &amp; Accreditation
            </h3>
            <p className="text-sm leading-relaxed text-justify text-blue-800 dark:text-gray-200">
              Our system complies with modern standards of healthcare data security, including encrypted transmission, secure storage,
              and strict access controls. The <strong>Expert System-Based Analysis of General Disease Symptoms</strong> is built to ensure
              data integrity, confidentiality, and reliability for both patients and medical professionals. Regular audits and updates
              are conducted to maintain security accreditation and compliance with health data regulations.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-300 mb-3">
              Customer Requirements
            </h3>
            <p className="text-sm leading-relaxed text-justify text-blue-800 dark:text-gray-200">
              We ensure a user-friendly experience for both patients and healthcare providers. The system supports intuitive symptom input,
              accurate diagnostic feedback, and data access tailored to roles (e.g., doctor, admin). Users are expected to input real
              information and follow ethical use guidelines. Healthcare institutions may request API access or data integration for extended services.
            </p>
          </div>

          {/* Section 3 */}
          <div className="mb-12">
            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-300 mb-3">
              Security &amp; Privacy Commitments
            </h3>
            <p className="text-sm leading-relaxed text-justify text-blue-800 dark:text-gray-200">
              Your data privacy is our top priority. All personal and symptom data is handled with strict confidentiality.
              We do not share or sell user information to third parties. The expert system uses anonymized data to improve
              diagnosis quality and system performance. We commit to transparency in how AI decisions are made and ensure
              that users can access, update, or delete their information at any time.
            </p>
          </div>
        </div>
      </section>
    
      {/* About Us Section */}
      {/* <AboutUs /> */}
    </>
  );
};

export default PrivacyPage;
