import React from "react";
import {
  Sparkles,
  History,
  ThumbsUp,
  User,
  LogOut,
} from "lucide-react";
import { useTheme } from "../App";

const Sidebar = ({
  activeSection,
  setActiveSection,
  setMode,
  handleLogout
}) => {
  const { theme } = useTheme();

  return (
    <aside
      className={`fixed top-0 left-0 flex flex-col items-center py-6 px-4 gap-4 border-r transition-colors duration-300 min-w-[80px] h-screen z-40 ${
        theme === "dark"
          ? "bg-gray-900/50 border-gray-700/80"
          : "bg-gray-50/50 border-gray-200/80"
      }`}
    >
      <button
        className="sidebar-btn"
        title="Home"
        onClick={() => {
          setActiveSection("home");
          setMode(null);
        }}
      >
        <div className="w-8 h-8 rounded-full bg-yellow-400"></div>
      </button>
      <button
        className={`sidebar-btn ${
          activeSection === "sparkle" ? "selected" : ""
        }`}
        title="Progress & Perks"
        onClick={() => setActiveSection("sparkle")}
      >
        <Sparkles size={24} />
      </button>
      <button
        className={`sidebar-btn ${
          activeSection === "history" ? "selected" : ""
        }`}
        title="Session History"
        onClick={() => setActiveSection("history")}
      >
        <History size={24} />
      </button>
      <button
        className={`sidebar-btn ${
          activeSection === "feedback" ? "selected" : ""
        }`}
        title="Feedback"
        onClick={() => setActiveSection("feedback")}
      >
        <ThumbsUp size={24} />
      </button>
      <div className="flex-1" />
      <button
        onClick={() => setActiveSection("profile")}
        className={`sidebar-btn ${
          activeSection === "profile" ? "selected" : ""
        }`}
        title="Profile"
      >
        <User size={24} />
      </button>
    </aside>
  );
};

export default Sidebar; 