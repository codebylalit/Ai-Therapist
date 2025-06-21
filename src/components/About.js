import React from "react";
import { useTheme } from "../App";

function About() {
  const { theme } = useTheme();

  return (
    <div
      className={`max-w-2xl mx-auto px-4 py-12 text-center transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <h2 className="text-3xl font-bold mb-4 text-yellow-500">
        About AI Therapist
      </h2>
      <p
        className={`mb-4 transition-colors duration-300 ${
          theme === "dark" ? "text-gray-300" : "text-gray-700"
        }`}
      >
        AI Therapist is designed to provide a safe, supportive space for you to
        express your feelings and receive compassionate, AI-powered responses.
        Our goal is to make emotional support accessible to everyone, anytime.
      </p>
      <p
        className={`mb-4 transition-colors duration-300 ${
          theme === "dark" ? "text-gray-300" : "text-gray-700"
        }`}
      >
        <b>Privacy:</b> Your conversations are never stored or shared.
        Everything you say stays between you and the AI.
      </p>
      <p
        className={`mb-4 transition-colors duration-300 ${
          theme === "dark" ? "text-gray-300" : "text-gray-700"
        }`}
      >
        <b>Technology:</b> This app uses Google Gemini AI for natural,
        empathetic conversation, and is built with React and Tailwind CSS for a
        modern, calmlyng experience.
      </p>
      <p
        className={`transition-colors duration-300 ${
          theme === "dark" ? "text-gray-300" : "text-gray-700"
        }`}
      >
        <b>Disclaimer:</b> AI Therapist is not a substitute for professional
        mental health care. If you are in crisis, please seek help from a
        qualified professional or contact emergency services.
      </p>
    </div>
  );
}

export default About;
