import React from "react";
import {
  LogOut,
  Trash2,
  History,
  MessageSquare,
  BarChart3,
  Zap,
  CheckCircle2,
  ChevronRight,
  Sun,
  Moon,
  SlidersHorizontal,
} from "lucide-react";
import { useTheme } from "../App";

const ContentSections = ({
  activeSection,
  theme,
  toggleTheme,
  user,
  handleLogout,
  sessionHistory,
  totalMessages,
  voiceCount,
  textCount,
  VOICE_LIMIT,
  analyticsCookies,
  setAnalyticsCookies,
  setShowResetPopup,
  setShowDeletePopup,
  loading,
  handleResetHistory,
  handleDeleteAccount,
  feedbackText,
  setFeedbackText,
  feedbackSubmitted,
  setFeedbackSubmitted,
  handleFeedbackSubmit,
  loadSession,
  deleteDoc,
  doc,
  db,
  setSessionHistory,
  setNotification,
  mode,
  setMode,
  chat,
  setChat,
  currentSessionId,
  setCurrentSessionId,
  setShowInputEndSessionPopup,
  saveSession,
  userProfile,
}) => {
  const Section = ({ title, description, children }) => (
    <div
      className={`border-b py-8 transition-colors duration-300 ${
        theme === "dark" ? "border-gray-700/80" : "border-gray-200/80"
      }`}
    >
      <h3
        className={`text-xl font-bold transition-colors duration-300 ${
          theme === "dark" ? "text-white" : "text-gray-800"
        }`}
      >
        {title}
      </h3>
      <p
        className={`mt-1 transition-colors duration-300 ${
          theme === "dark" ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {description}
      </p>
      <div className="mt-6">{children}</div>
    </div>
  );

  const Toggle = ({
    label,
    description,
    enabled,
    onToggle,
    disabled = false,
  }) => (
    <div className="flex items-center justify-between">
      <div>
        <p
          className={`font-semibold transition-colors duration-300 ${
            disabled
              ? theme === "dark"
                ? "text-gray-600"
                : "text-gray-400"
              : theme === "dark"
              ? "text-gray-200"
              : "text-gray-700"
          }`}
        >
          {label}
        </p>
        <p
          className={`text-sm transition-colors duration-300 ${
            theme === "dark" ? "text-gray-500" : "text-gray-500"
          }`}
        >
          {description}
        </p>
      </div>
      <button
        onClick={() => !disabled && onToggle(!enabled)}
        className={`w-11 h-6 flex items-center rounded-full transition-colors ${
          enabled
            ? theme === "dark"
              ? "bg-gray-600"
              : "bg-gray-800"
            : theme === "dark"
            ? "bg-gray-700"
            : "bg-gray-200"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
        disabled={disabled}
      >
        <span
          className={`w-5 h-5 rounded-full shadow transform transition-transform ${
            enabled ? "translate-x-5" : "translate-x-1"
          } ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
        />
      </button>
    </div>
  );

  if (activeSection === "profile") {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center justify-between pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white text-xl font-bold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p
                className={`font-semibold transition-colors duration-300 ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}
              >
                {userProfile?.name || user.email}
              </p>
              {userProfile?.name && (
                <p
                  className={`text-sm transition-colors duration-300 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {user.email}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>

        <Section
          title="Privacy Settings"
          description="Manage your cookie and tracking preferences"
        >
          <div className="space-y-4">
            <Toggle
              label="Necessary Cookies"
              description="Required for the website to function properly"
              enabled={true}
              disabled={true}
              onToggle={() => {}}
            />
            <Toggle
              label="Analytics Cookies"
              description="Help us understand how visitors interact with our website"
              enabled={analyticsCookies}
              onToggle={setAnalyticsCookies}
            />
          </div>
        </Section>

        <Section
          title="Usage Analytics"
          description="How much you've used calmly"
        >
          <div
            className={`p-6 rounded-xl border transition-colors duration-300 ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200/80"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <p
                className={`font-semibold transition-colors duration-300 ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}
              >
                Your Plan
              </p>
              <span
                className={`px-2 py-1 text-xs font-bold rounded-full ${
                  theme === "dark"
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Free
              </span>
            </div>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <p
                    className={`font-medium transition-colors duration-300 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Text Sessions
                  </p>
                  <p
                    className={`font-mono transition-colors duration-300 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Unlimited
                  </p>
                </div>
                <div
                  className={`w-full rounded-full h-2 ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`h-2 rounded-full ${
                      theme === "dark" ? "bg-gray-500" : "bg-gray-400"
                    }`}
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <p
                    className={`font-medium transition-colors duration-300 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Voice Sessions
                  </p>
                  <p
                    className={`font-mono transition-colors duration-300 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {voiceCount} / {VOICE_LIMIT}
                  </p>
                </div>
                <div
                  className={`w-full rounded-full h-2 ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}
                >
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        (voiceCount / VOICE_LIMIT) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <button className="mt-6 w-full md:w-auto px-5 py-2 rounded-lg bg-yellow-400 text-yellow-900 font-bold hover:bg-yellow-500 transition-colors">
              Upgrade
            </button>
          </div>
        </Section>

        <Section
          title="Danger Zone"
          description="Be careful with these settings"
        >
          <div className="space-y-4">
            <div>
              <button
                onClick={() => setShowResetPopup(true)}
                className={`px-5 py-2 rounded-lg border font-bold transition-colors ${
                  theme === "dark"
                    ? "border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-200"
                    : "border-gray-300 bg-white hover:bg-gray-100 text-gray-800"
                }`}
              >
                Reset Chat History
              </button>
              <p
                className={`text-sm mt-2 transition-colors duration-300 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                This will reset all of your previous conversations and you
                start from a clean slate.
              </p>
            </div>
            <div>
              <button
                onClick={() => setShowDeletePopup(true)}
                className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold"
              >
                Delete Account
              </button>
              <p
                className={`text-sm mt-2 transition-colors duration-300 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                This will permanently delete your account and everything
                related to it.
              </p>
            </div>
          </div>
        </Section>
      </div>
    );
  }

  if (activeSection === "history") {
    return (
      <div className="flex flex-col w-full h-full">
        <h2
          className={`text-3xl font-bold mb-6 transition-colors duration-300 ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          Session History
        </h2>
        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
          {sessionHistory.length === 0 ? (
            <div
              className={`text-center mt-12 transition-colors duration-300 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No sessions yet. Start a new conversation!
            </div>
          ) : (
            sessionHistory.map((session, index) => {
              let dateStr = "";
              if (session.createdAt) {
                let dateObj = session.createdAt.toDate
                  ? session.createdAt.toDate()
                  : new Date(session.createdAt);
                dateStr = !isNaN(dateObj)
                  ? dateObj.toLocaleDateString()
                  : "";
              }
              return (
                <div
                  key={session.id}
                  className={`relative rounded-xl shadow-sm border p-2 cursor-pointer hover:shadow-md transition-all flex flex-col min-h-[60px] max-w-xl mx-auto ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                      : "bg-white border-gray-200/80 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-2 right-2 text-sm transition-colors duration-300 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {dateStr || "No Date"}
                  </div>
                  <div
                    onClick={() => loadSession(session.id)}
                    className="flex-1 min-w-0"
                  >
                    <div
                      className={`font-semibold mb-2 transition-colors duration-300 ${
                        theme === "dark" ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Session {sessionHistory.length - index}
                    </div>
                    <p
                      className={`text-sm line-clamp-2 transition-colors duration-300 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {session.messages[0]?.message || "No messages"}
                    </p>
                    <div
                      className={`text-xs mt-2 transition-colors duration-300 ${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {session.messages.length} messages
                    </div>
                  </div>
                  <button
                    className="absolute bottom-2 right-2 flex px-2 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition-colors"
                    title="Delete session"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await deleteDoc(doc(db, "sessions", session.id));
                        setSessionHistory((prev) =>
                          prev.filter((s) => s.id !== session.id)
                        );
                        setNotification({
                          message: "Session deleted!",
                          type: "success",
                        });
                      } catch (err) {
                        setNotification({
                          message: "Failed to delete session.",
                          type: "error",
                        });
                      }
                    }}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  if (activeSection === "sparkle") {
    return (
      <div className="flex flex-col w-full h-full p-4 md:p-6">
        <h2
          className={`text-3xl font-bold mb-8 transition-colors duration-300 ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          Your Progress & Perks
        </h2>
        <div className="mb-10">
          <h3
            className={`text-xl font-semibold mb-4 transition-colors duration-300 ${
              theme === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Activity Stats
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              className={`p-6 rounded-xl shadow-sm border flex items-center gap-4 transition-colors duration-300 ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200/80"
              }`}
            >
              <div className="p-3 bg-blue-100 rounded-full">
                <History size={24} className="text-blue-600" />
              </div>
              <div>
                <p
                  className={`text-sm transition-colors duration-300 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Total Sessions
                </p>
                <p
                  className={`text-2xl font-bold transition-colors duration-300 ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}
                >
                  {sessionHistory.length}
                </p>
              </div>
            </div>
            <div
              className={`p-6 rounded-xl shadow-sm border flex items-center gap-4 transition-colors duration-300 ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200/80"
              }`}
            >
              <div className="p-3 bg-green-100 rounded-full">
                <MessageSquare size={24} className="text-green-600" />
              </div>
              <div>
                <p
                  className={`text-sm transition-colors duration-300 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Messages Exchanged
                </p>
                <p
                  className={`text-2xl font-bold transition-colors duration-300 ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}
                >
                  {totalMessages}
                </p>
              </div>
            </div>
            <div
              className={`p-6 rounded-xl shadow-sm border flex items-center gap-4 transition-colors duration-300 ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200/80"
              }`}
            >
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 size={24} className="text-purple-600" />
              </div>
              <div>
                <p
                  className={`text-sm transition-colors duration-300 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Avg. Session
                </p>
                <p
                  className={`text-2xl font-bold transition-colors duration-300 ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}
                >
                  ~12 min
                </p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3
            className={`text-xl font-semibold mb-4 transition-colors duration-300 ${
              theme === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Unlock More with Pro
          </h3>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl text-white shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="md:w-2/3">
                <h4 className="text-2xl font-bold mb-3 flex items-center gap-2">
                  <Zap className="text-yellow-400" />
                  calmly Pro
                </h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-3">
                    <CheckCircle2
                      size={18}
                      className="text-green-400 flex-shrink-0"
                    />
                    <span>Unlimited voice sessions</span>
                  </li>{" "}
                  <li className="flex items-center gap-3">
                    <CheckCircle2
                      size={18}
                      className="text-green-400 flex-shrink-0"
                    />
                    <span>Unlimited session history</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2
                      size={18}
                      className="text-green-400 flex-shrink-0"
                    />
                    <span>Advanced mood tracking & analytics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2
                      size={18}
                      className="text-green-400 flex-shrink-0"
                    />
                    <span>Access to specialized therapy modules</span>
                  </li>
                </ul>
              </div>
              <div className="flex-shrink-0">
                <button className="w-full md:w-auto px-8 py-3 rounded-lg bg-yellow-400 text-gray-900 font-bold text-lg hover:bg-yellow-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === "feedback") {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="w-full max-w-lg text-center">
          <h2
            className={`text-3xl font-bold mb-4 transition-colors duration-300 ${
              theme === "dark" ? "text-white" : "text-gray-800"
            }`}
          >
            Share Your Feedback
          </h2>
          <p
            className={`mb-8 transition-colors duration-300 ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            We'd love to hear your thoughts on how we can improve your
            experience.
          </p>
          {feedbackSubmitted ? (
            <div className="bg-green-100 text-green-800 p-6 rounded-xl text-center">
              <h3 className="font-bold text-xl mb-2">Thank You!</h3>
              <p>Your feedback has been submitted successfully.</p>
              <button
                onClick={() => setFeedbackSubmitted(false)}
                className="mt-4 px-6 py-2 rounded-lg bg-green-600 text-white font-semibold"
              >
                Submit another
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleFeedbackSubmit}
              className={`rounded-xl shadow-sm border p-8 transition-colors duration-300 ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200/80"
              }`}
            >
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us what you think..."
                className={`w-full h-40 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-shadow mb-4 ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "border-gray-300 text-gray-800 placeholder-gray-500"
                }`}
                required
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-white font-bold transition-colors disabled:bg-gray-300"
              >
                {loading ? "Submitting..." : "Submit Feedback"}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (activeSection === "home" && mode === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div className="flex items-center justify-center mb-8 gap-4">
          <div className="w-10 h-10 calmly-zoom rounded-full bg-yellow-400"></div>
          <div
            className={`text-xl font-semibold transition-colors duration-300 ${
              theme === "dark" ? "text-white" : "text-gray-800"
            }`}
          >
            coffee and calmly time?
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                : "bg-white border-gray-200/80 hover:bg-gray-50"
            }`}
            onClick={() => {
              setMode("voice");
            }}
          >
            <div className="flex flex-col items-start ml-1">
              <span
                className={`font-semibold text-sm transition-colors duration-300 ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}
              >
                voice mode
              </span>
              <span
                className={`block text-xs transition-colors duration-300 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                just speak, i'm all ears
              </span>
            </div>
            <ChevronRight
              size={20}
              className={`transition-colors duration-300 ${
                theme === "dark" ? "text-gray-500" : "text-gray-400"
              }`}
            />
          </button>
          <button
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                : "bg-white border-gray-200/80 hover:bg-gray-50"
            }`}
            onClick={() => {
              setMode("text");
            }}
          >
            <div className="flex flex-col items-start ml-1">
              <span
                className={`font-semibold text-sm transition-colors duration-300 ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}
              >
                text mode
              </span>
              <span
                className={`block text-xs transition-colors duration-300 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                not in the talking mood?
              </span>
            </div>
            <ChevronRight
              size={20}
              className={`transition-colors duration-300 ${
                theme === "dark" ? "text-gray-500" : "text-gray-400"
              }`}
            />
          </button>
        </div>
      </div>
    );
  }

  return null;
};
export default ContentSections; 