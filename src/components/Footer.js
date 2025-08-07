import React from "react";
import { useTheme } from "../App";
import { Link } from "react-router-dom";

function Footer() {
  const { theme } = useTheme();

  return (
    <footer
      className={`w-full border-t pt-12 pb-8 flex flex-col items-center transition-colors duration-300 ${
        theme === "dark" ? "border-gray-700" : "border-gray-100"
      }`}
    >
      <h3
        className={`text-xl font-bold mb-2 transition-colors duration-300 ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}
      >
        get started for free
      </h3>
      <div
        className={`mb-4 transition-colors duration-300 ${
          theme === "dark" ? "text-gray-400" : "text-gray-500"
        }`}
      >
        be heard. be understood. be better.
      </div>
      <Link to="/home">
        <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded px-6 py-3 text-lg shadow mb-8">
          try calmly free
        </button>
      </Link>
      <div
        className={`flex flex-wrap justify-center gap-8 text-sm mb-2 transition-colors duration-300 ${
          theme === "dark" ? "text-gray-400" : "text-gray-400"
        }`}
      >
        <span
          className={`font-bold transition-colors duration-300 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          calmly
        </span>
        {/* <span>
          socials
          <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="ml-1">instagram</a>{' '}
          <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="ml-1">linkedin</a>
        </span> */}
        <span>
          <Link to="/legal" className="">legal</Link>{' '}
          <Link to="/privacy-policy" className="">privacy policy</Link>{' '}
          <Link to="/terms-of-service" className="">terms of service</Link>{' '}
        </span>
      </div>
      <div
        className={`text-xs transition-colors duration-300 ${
          theme === "dark" ? "text-gray-500" : "text-gray-300"
        }`}
      >
        © 2025 calmly
      </div>
    </footer>
  );
}

export default Footer;
