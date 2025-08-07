import React from 'react';
import { useTheme } from '../App';

function Legal() {
  const { theme } = useTheme();
  return (
    <div className={`max-w-2xl mx-auto px-4 py-12 text-left transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      <h2 className="text-3xl font-bold mb-4 text-yellow-500 text-center">Legal Notice</h2>
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Intellectual Property</h3>
        <p>
          All content, trademarks, logos, and intellectual property displayed on calmly.so are the property of their respective owners. Unauthorized use, reproduction, or distribution of any material from this website is strictly prohibited without prior written consent.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">User Responsibilities</h3>
        <p>
          By accessing and using calmly.so, you agree to comply with all applicable laws and regulations. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Limitation of Liability</h3>
        <p>
          Calmly.so and its owners are not liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use this website. All information provided is for informational purposes only and does not constitute professional advice.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Contact Information</h3>
        <p>
          For any legal inquiries or concerns, please contact us at <a href="mailto:support@calmly.so" className="underline">support@calmly.so</a>.
        </p>
      </section>
    </div>
  );
}

export default Legal; 