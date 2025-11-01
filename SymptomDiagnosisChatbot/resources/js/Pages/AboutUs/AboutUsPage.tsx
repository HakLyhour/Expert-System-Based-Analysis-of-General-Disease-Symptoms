import React from "react";

const AboutUs: React.FC = () => (
  <div className="min-h-screen bg-[#EEF6FE] dark:bg-gray-900 transition-colors">
    <main className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-5xl font-bold text-center text-blue-600 dark:text-blue-400 mb-12">
        About Us
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left column: Mission & Vision */}
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">
              Our Mission
            </h2>
            <p className="text-blue-800 dark:text-gray-200 leading-relaxed">
              At Norton University, our mission is to cultivate a new generation
              of leaders, innovators, and responsible global citizens through
              excellence in education, research, and community engagement. We
              are committed to delivering high-quality, industry-relevant
              academic programs that empower students with the knowledge,
              skills, and ethical values necessary to succeed in a rapidly
              changing world. We strive to foster a dynamic and inclusive
              learning environment that encourages critical thinking,
              creativity, and lifelong learning. By building strong partnerships
              with local and international institutions, we aim to contribute
              meaningfully to national development and global progress.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">
              Our Vision
            </h2>
            <p className="text-blue-800 dark:text-gray-200 leading-relaxed">
              Norton University envisions becoming a leading center of
              excellence in higher education and research in Cambodia and the
              region. We aspire to shape future-ready graduates who are
              intellectually competent, technologically skilled, ethically
              grounded, and globally engaged. By embracing innovation, academic
              rigor, and international collaboration, we aim to inspire
              transformative impact in society and contribute to sustainable
              development on both a national and global scale.
            </p>
          </section>
        </div>

        {/* Right column: Logo + Team */}
        <div className="space-y-8">
          <div className="flex justify-center">
            <img
              src="/assets/nu_bg.jpg"
              alt="Norton University Logo"
              className="h-64 w-64 md:h-80 md:w-80 object-contain"
            />
          </div>

          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">
              Our Team
            </h2>
            <p className="text-blue-800 dark:text-gray-200 leading-relaxed">
              At Norton University, our team is composed of dedicated educators,
              researchers, administrators, and support staff who share a common
              commitment to academic excellence and student success. Our faculty
              members are experts in their fields, bringing both academic and
              industry experience into the classroom to provide students with a
              well-rounded and practical education. Our leadership team ensures
              strategic growth and institutional quality, while our
              administrative staff work tirelessly to create an efficient and
              supportive environment for learning and innovation. Together, we
              foster a culture of collaboration, integrity, and continuous
              improvement that empowers every student to reach their full
              potential.
            </p>
          </section>
        </div>
      </div>
    </main>
  </div>
);

export default AboutUs;
