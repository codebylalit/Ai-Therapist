import React from "react";
import { useTheme } from "../App";

const PrivacyPolicy = () => {
  const { theme } = useTheme();
  return (
    <div className={`max-w-2xl mx-auto px-4 py-12 text-left transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      <h2 className="text-3xl font-bold mb-4 text-yellow-500 text-center">Privacy Policy</h2>
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Information We Collect</h3>
        <p>
          Calmly.so may collect personal information such as your email address and usage data when you sign up or interact with our services. We do not store or share your chat conversations.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">How We Use Your Information</h3>
        <p>
          We use your information to provide, maintain, and improve our services, communicate with you, and ensure the security of our platform. Your data is never sold to third parties.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Cookies</h3>
        <p>
          Calmly.so uses cookies to enhance your experience and analyze site usage. You can control cookies through your browser settings.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Third-Party Services</h3>
        <p>
          We may use third-party services such as analytics tools to help us understand how our platform is used. These services may collect information sent by your browser as part of a web page request.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Your Rights</h3>
        <p>
          You have the right to access, update, or delete your personal information. To exercise these rights, please contact us at <a href="mailto:support@calmly.so" className="underline">support@calmly.so</a>.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Contact</h3>
        <p>
          If you have any questions or concerns about our privacy practices, please contact us at <a href="mailto:support@calmly.so" className="underline">support@calmly.so</a>.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy; 