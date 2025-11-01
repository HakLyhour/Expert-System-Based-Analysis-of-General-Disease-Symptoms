import React from 'react';
import { Link } from '@inertiajs/react';
import { FaArrowLeft } from 'react-icons/fa';

export default function TermsPolicyPage(){
  return (
    <div className="min-h-screen bg-blue-50 text-gray-800 transition-colors px-4 py-10 flex flex-col items-center">
      {/* Logo */}
      <div className="mb-6">
        <img
          src="/assets/logo.jpg"
          alt="Logo"
          className="h-16 w-auto object-contain"
        />
      </div>

      {/* Page Title */}
      <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center transition-colors">
        Terms and Privacy Policy
      </h1>

      {/* Content */}
      <div className="w-full max-w-2xl bg-white rounded-lg p-6 shadow-md border border-blue-100 space-y-6 text-sm sm:text-base leading-relaxed transition-colors">
        <section>
          <h2 className="text-lg font-semibold text-blue-600 mb-2 transition-colors">
            Terms of Service
          </h2>
          <p>
            By accessing or using our application, you agree to be bound by these Terms of Service. We may update these terms from time to time, so please review them regularly. Your continued use of the service after any changes means you accept the revised terms.
          </p>
          <p>
            You agree not to misuse the service or help anyone else to do so. Misuse includes, but is not limited to, attempting unauthorized access, distributing malware, or using the service for illegal activities.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-blue-600 mb-2 transition-colors">
            Privacy Policy
          </h2>
          <p>
            We value your privacy. Any data you provide to us, such as your email address, name, or other personal details, will be handled in accordance with our privacy practices. We do not share your information with third parties without your consent, except as required by law.
          </p>
          <p>
            We may use cookies and similar technologies to improve user experience, analyze usage patterns, and personalize content. You can manage your cookie preferences through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-blue-600 mb-2 transition-colors">
            Your Responsibilities
          </h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and password. Please notify us immediately if you suspect any unauthorized use of your account.
          </p>
          <p>
            If you have any questions or concerns about these terms or our privacy practices, please contact us at <span className="text-blue-600 underline">support@example.com</span>.
          </p>
        </section>
      </div>

      {/* Back to Home Button */}
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium transition-colors"
      >
        <FaArrowLeft /> Back
      </Link>
    </div>
  );
};

