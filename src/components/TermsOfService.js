import React from "react";
import { useTheme } from "../App";

const TermsOfService = () => {
  const { theme } = useTheme();
  return (
    <div className={`max-w-2xl mx-auto px-4 py-12 text-left transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      <h2 className="text-3xl font-bold mb-4 text-yellow-500 text-center">Terms of Service</h2>
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Acceptance of Terms</h3>
        <p>
          By accessing or using calmly.so, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree, please do not use our platform.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">User Conduct</h3>
        <p>
          You agree to use calmly.so only for lawful purposes and in a way that does not infringe the rights of others or restrict their use of the platform. Harassment, abuse, or any form of harmful behavior is strictly prohibited.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Accounts</h3>
        <p>
          You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. Notify us immediately of any unauthorized use.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Limitations</h3>
        <p>
          Calmly.so is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free service. We are not liable for any damages resulting from the use or inability to use the platform.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Termination</h3>
        <p>
          We reserve the right to suspend or terminate your access to calmly.so at our discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users or the platform.
        </p>
      </section>
    </div>
  );
};

export default TermsOfService; 