import React from "react";
import { useTheme } from "../App";

function AiDisclaimer() {
  const { theme } = useTheme();
  return (
    <div className={`max-w-2xl mx-auto px-4 py-12 text-left transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      <h2 className="text-3xl font-bold mb-4 text-yellow-500 text-center">AI Disclaimer</h2>
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">AI Limitations</h3>
        <p>
          Calmly is powered by artificial intelligence and provides responses based on patterns in data. While we strive for accuracy and empathy, the AI may not always understand context or provide appropriate advice.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">No Medical or Professional Advice</h3>
        <p>
          The information and responses provided by Calmly are for informational and supportive purposes only. They do not constitute medical, psychological, or professional advice. Always consult a qualified professional for serious concerns.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Emergency Guidance</h3>
        <p>
          If you are experiencing a crisis or emergency, please contact a mental health professional or emergency services immediately. Calmly is not equipped to handle urgent situations.
        </p>
      </section>
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">User Responsibility</h3>
        <p>
          Users are responsible for their own actions and decisions. Calmly and its creators are not liable for any outcomes resulting from the use of this platform.
        </p>
      </section>
    </div>
  );
}

export default AiDisclaimer; 