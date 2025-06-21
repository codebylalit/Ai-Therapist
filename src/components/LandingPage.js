import React from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import FeatureCard from "./FeatureCard";
import FAQAccordion from "./FAQAccordion";
import { useTheme } from "../App";

// Icons
const ShieldIcon = () => (
  <svg
    className="w-7 h-7 text-yellow-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.917l9 3 9-3a12.02 12.02 0 00-2.382-8.977z"
    ></path>
  </svg>
);
const BrainIcon = () => (
  <svg
    className="w-7 h-7 text-yellow-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4.871 14.823c-1.218-1.223-1.871-2.883-1.871-4.646C3 8.017 4.455 6.32 6.182 5.34c1.727-.98 3.818-.98 5.545 0 .93.528 1.764 1.277 2.455 2.162M4.871 14.823c-1.353.484-2.871.182-4.09-.618M4.871 14.823c1.218 1.223 2.871 1.87 4.644 1.87h.01c1.773 0 3.426-.647 4.644-1.87M19.129 14.823c1.218-1.223 1.871-2.883 1.871-4.646 0-2.16-1.455-3.857-3.182-4.837-1.727-.98-3.818-.98-5.545 0-.93.528-1.764 1.277-2.455 2.162m4.9 7.301c1.353.484 2.871.182 4.09-.618m-4.09.618c-1.218 1.223-2.871 1.87-4.644 1.87h-.01c-1.773 0-3.426-.647-4.644-1.87m9.288-5.43c.53-1.533.53-3.21 0-4.743"
    ></path>
  </svg>
);
const ProfileIcon = () => (
  <svg
    className="w-7 h-7 text-yellow-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    ></path>
  </svg>
);
const DocumentIcon = () => (
  <svg
    className="w-7 h-7 text-yellow-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    ></path>
  </svg>
);
const MoonIcon = () => (
  <svg
    className="w-7 h-7 text-yellow-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    ></path>
  </svg>
);

const features = [
  {
    title: "safe & sound",
    desc: "spill all the tea — calmly's got you. your sessions are secure and confidential.",
    icon: <ShieldIcon />,
  },
  {
    title: "remembers everything",
    desc: "calmly keeps your whole story in mind. it learns from every conversation, getting to know you better.",
    icon: <BrainIcon />,
  },
  {
    title: "therapy profile",
    desc: "your mental health, mapped out. see insights, recognize patterns, and understand yourself better over time.",
    icon: <ProfileIcon />,
  },
  {
    title: "session breakdowns",
    desc: "support doesn't end when your chat does. get clear session breakdowns, personalized tips, and homework that sticks.",
    icon: <DocumentIcon />,
  },
  {
    title: "dark mode",
    desc: "switch between light and dark themes for comfortable viewing anytime.",
    icon: <MoonIcon />,
  },
];

const faqs = [
  {
    q: "what is calmly?",
    a: "calmly is your AI-powered companion for exploring your thoughts, emotions, and behaviors in a safe, supportive space.",
  },
  {
    q: "how does calmly work?",
    a: "calmly uses advanced AI to chat with you, listen, and offer support. You can talk or type, and calmly adapts to your needs.",
  },
  {
    q: "is calmly a replacement for traditional therapy?",
    a: "no, calmly is not a replacement for professional therapy. It's a supportive tool for everyday mental wellness.",
  },
  {
    q: "is my data secure and confidential?",
    a: "yes! your privacy is a top priority. sessions are confidential and never shared.",
  },
  {
    q: "does calmly support multiple languages?",
    a: "currently, calmly works best in English, but more languages are coming soon.",
  },
];

const Waveform = () => (
  <div className="flex items-center justify-center gap-px h-10">
    {[...Array(25)].map((_, i) => (
      <span
        key={i}
        className="w-0.5 bg-gray-300 dark:bg-gray-600"
        style={{
          height: `${Math.random() * 75 + 25}%`,
          animation: `waveform 1.2s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.05}s`,
        }}
      />
    ))}
    <style jsx>{`
      @keyframes waveform {
        0% {
          transform: scaleY(0.1);
        }
        100% {
          transform: scaleY(1);
        }
      }
    `}</style>
  </div>
);

function LandingPage() {
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen w-full flex flex-col ${
        theme === "dark" ? "bg-[#0F172A] text-white" : "bg-gray-50 text-black"
      }`}
    >
      <div className="w-full max-w-6xl mx-auto px-12 sm:px-12 lg:px-18">
        {/* Navbar */}
        <nav className="flex items-center justify-between py-12">
          <Link
            to="/"
            className={`text-2xl font-bold transition-colors duration-300 ${
              theme === "dark" ? "text-white" : "text-black"
            }`}
          >
            calmly
          </Link>
          <div className="flex items-center gap-2 font-medium">
            <Link
              to="/login"
              className={`transition-colors duration-300 px-3 py-1.5 rounded-lg text-sm ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              log in
            </Link>
            <Link
              to="/signup"
              className={`transition-colors duration-300 rounded-lg px-3 py-1.5 text-sm text-black font-semibold bg-yellow-400 hover:bg-yellow-500`}
            >
              sign up
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <main className="mt-20 sm:mt-24">
          {/* Headline Section */}
          <div className="max-w-2xl">
            <h1
              className={`text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-4 ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            >
              it's not therapy.
              <br />
              it's just calmly.
            </h1>
            <p
              className={`text-lg md:text-xl max-w-xl mb-6 ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              your wise ai built to sit with your thoughts, name your emotions, and reflect
              on your behaviors — without judgment
            </p>
            <Link to="/login">
              <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg px-4 py-2 text-base shadow-sm">
                start yapping — it's free
              </button>
            </Link>
            {/* <p
              className={`text-xs mt-2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              loved by 100,000+ cool people
            </p> */}
          </div>

          {/* Interactive Card Section */}
          <div className="mt-20 flex justify-center">
            <div
              className={`w-full max-w-6xl rounded-2xl shadow-lg flex flex-col items-center justify-between p-8 transition-all duration-300 h-[28rem] ${
                theme === "dark" ? "bg-[#1E293B]" : "bg-white"
              }`}
            >
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                listening...
              </p>

              <div className="w-36 h-36 bg-yellow-400 rounded-full flex items-center justify-center"></div>

              <div className="text-center w-full">
                <p
                  className={`mb-4 text-sm max-w-sm mx-auto ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  okay, so it sounds like you're feeling pretty shook right now.
                  what's been going on that's got you in your feels?
                </p>

                <Waveform />

                <div className="flex items-center justify-center gap-4 mt-4">
                  <button
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      theme === "dark"
                        ? "bg-slate-600/50 hover:bg-slate-600 text-gray-300"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-500"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5L6 9H2v6h4l5 4V5z"
                      ></path>
                    </svg>
                  </button>
                  <button className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-white shadow-md hover:bg-yellow-500 transition-all duration-300">
                    <div
                      className={`w-8 h-8 rounded-full ${
                        theme === "dark" ? "bg-yellow-300" : "bg-yellow-500"
                      }`}
                    ></div>
                  </button>
                  <button
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      theme === "dark"
                        ? "bg-slate-600/50 hover:bg-slate-600 text-gray-300"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-500"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Features Section */}
          <div className="mt-28">
            <h2
              className={`text-4xl font-bold mb-12 text-center transition-colors duration-300 ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            >
              all the good stuff
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {features.map((f, i) => (
                <FeatureCard
                  key={i}
                  title={f.title}
                  desc={f.desc}
                  icon={f.icon}
                />
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="my-28 items-center">
            <h2
              className={`text-4xl font-bold mb-12 text-center transition-colors duration-300 ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            >
              frequently asked questions
            </h2>
            <div className="max-w-3xl mx-auto">
              <FAQAccordion faqs={faqs} />
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default LandingPage;
