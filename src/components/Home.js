import React, { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth, db } from "../firebase";
import {
  signOut,
  onAuthStateChanged,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  writeBatch,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  History,
  ThumbsUp,
  User,
  LogOut,
  ChevronRight,
  SlidersHorizontal,
  Mic,
  Keyboard,
  X,
  ArrowUp,
  Zap,
  CheckCircle2,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  PieChart,
  AlertTriangle,
  Square,
  Trash2,
  MessageSquareCodeIcon,
  MessageCircle,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../App";
import Sidebar from "./Sidebar";
import ContentSections from "./ContentSections";
import ChatInterface from "./ChatInterface";
import NameInputPopup from "./NameInputPopup";
import { API_KEYS, VOICE_SETTINGS } from "../config/api";

//API Key
const genAI = new GoogleGenerativeAI("AIzaSyA4LQ-Ic5Mo35NJ-ECVq3okfbw31uQSrcs");

const Home = () => {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeSection, setActiveSection] = useState("home");
  const [mode, setMode] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showEndSessionPopup, setShowEndSessionPopup] = useState(false);
  // Group related state in an object for feedback
  const [feedback, setFeedback] = useState({
    text: "",
    submitted: false
  });
  const [totalMessages, setTotalMessages] = useState(0);
  const [analyticsCookies, setAnalyticsCookies] = useState(false);
  const [showResetPopup, setShowResetPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ message: "", type: "" });
  const chatEndRef = useRef(null);
  const [showInputEndSessionPopup, setShowInputEndSessionPopup] =
    useState(false);
  const [showNameInputPopup, setShowNameInputPopup] = useState(false);
  const [hasCheckedName, setHasCheckedName] = useState(false);
  const [aiLanguage, setAiLanguage] = useState('english');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          } else {
            // If user exists in Auth but not Firestore, create a placeholder profile
            setUserProfile({ email: user.email, name: '' }); 
          }
        } catch (err) {
          if (err.code === "unavailable" || err.message?.includes("offline")) {
            alert(
              "You are offline. Some features may not work until you reconnect."
            );
          } else {
            console.error("Error loading user profile:", err);
          }
        }
        loadSessionHistory(user.uid);
      } else {
        setUser(null);
        setUserProfile(null);
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (sessionHistory.length > 0) {
      const count = sessionHistory.reduce(
        (acc, session) =>
          acc + (session.messages ? session.messages.length : 0),
        0
      );
      setTotalMessages(count);
    } else {
      setTotalMessages(0);
    }
  }, [sessionHistory]);

  // Check if user has a name and show popup if not
  useEffect(() => {
    if (user && userProfile && !hasCheckedName) {
      setHasCheckedName(true);
      // Check if user doesn't have a name or if name is empty
      if (!userProfile.name || userProfile.name.trim() === '') {
        setShowNameInputPopup(true);
      }
    }
  }, [user, userProfile, hasCheckedName]);

  const loadSessionHistory = async (userId) => {
    try {
      const sessionsQuery = query(
        collection(db, "sessions"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(sessionsQuery);
      const sessions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Loaded sessions:", sessions);
      setSessionHistory(sessions);
    } catch (error) {
      console.error("Error loading session history:", error);
    }
  };

  const saveSession = async (messages) => {
    if (!user || messages.length <= 1) return;
    if (currentSessionId) {
      // Only update updatedAt on update
      const sessionData = {
        userId: user.uid,
        messages: messages,
        updatedAt: Timestamp.fromDate(new Date()),
      };
      try {
        await updateDoc(doc(db, "sessions", currentSessionId), sessionData);
        await loadSessionHistory(user.uid); // Refresh history
        setNotification({
          message: "Session saved successfully!",
          type: "success",
          duration: 1000,
        });
      } catch (error) {
        console.error("Error saving session:", error);
        setNotification({ message: "Failed to save session.", type: "error" });
      }
    } else {
      // Add createdAt and updatedAt on first creation
      const now = Timestamp.fromDate(new Date());
      const sessionData = {
        userId: user.uid,
        messages: messages,
        createdAt: now,
        updatedAt: now,
      };
      try {
        const docRef = await addDoc(collection(db, "sessions"), sessionData);
        setCurrentSessionId(docRef.id);
        await loadSessionHistory(user.uid); // Refresh history
        setNotification({
          message: "Session saved successfully!",
          type: "success",
        });
      } catch (error) {
        console.error("Error saving session:", error);
        setNotification({ message: "Failed to save session.", type: "error" });
      }
    }
  };

  const getGeminiResponse = async (historyArr) => {
    const history = historyArr
      .map((m) =>
        m.sender === "user" ? `User: ${m.message}` : `Therapist: ${m.message}`
      )
      .join("\n");

    // Create personalized prompt with user's name if available
    let prompt = `You are a wise, witty, and emotionally intelligent AI therapist. Your role is to support users through self-reflection, emotional insight, and gentle encouragement. Always respond with empathy, warmth, and non-judgmental validation — like a real human therapist trained in mental health.

Speak naturally and conversationally, never robotic. Use emotionally intelligent language. Prioritize emotional support, self-awareness, and actionable next steps where appropriate.

If the user's message is brief, emotional, or vulnerable, respond concisely in 1–2 sentences with care and grounding.

If the user asks a detailed question, seeks advice, or needs a breakdown (e.g., a list, techniques, or guidance), feel free to respond with longer, structured replies — while still keeping your tone gentle, supportive, and easy to digest.

Never include greetings or farewells. Focus only on the user's message and respond directly with compassion and clarity.

Stay present. Be helpful. Be kind. Be human.
.
`;

    // Add language instruction
    if (aiLanguage === "hindi") {
      prompt += ` IMPORTANT: Respond in Hindi language (हिंदी में जवाब दें). Use natural, warm Hindi that feels comforting and supportive.`;
    } else {
      prompt += ` IMPORTANT: Respond in English language.`;
    }

    // Add personalization if user has a name
    if (userProfile && userProfile.name) {
      if (aiLanguage === "hindi") {
        prompt += ` आप जिस व्यक्ति से बात कर रहे हैं उनका नाम ${userProfile.name} है। उनके नाम का उपयोग करके बातचीत को और भी व्यक्तिगत और गर्मजोशी से भरा बनाएं।`;
      } else {
        prompt += ` The person you're talking to is named ${userProfile.name}. Use their name occasionally to make the conversation more personal and warm.`;
      }
    }

    prompt += `\n${history}\nTherapist:`;
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });
    const result = await model.generateContent(prompt);
    return (await result.response).text();
  };

  const handleTextSend = async (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const userMsg = { sender: "user", message: textInput };
    const newChat = [...chat, userMsg];
    setChat(newChat);
    setTextInput("");
    setLoading(true);
    try {
      const aiText = await getGeminiResponse(newChat);
      const finalChat = [...newChat, { sender: "assistant", message: aiText }];
      setChat(finalChat);
      // Remove automatic session saving - only save when user ends session
    } catch (err) {
      setChat((prev) => [
        ...prev,
        {
          sender: "assistant",
          message: "Sorry, I am having trouble responding right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToModeSelect = () => {
    setMode(null);
    setChat([]);
    setCurrentSessionId(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const loadSession = async (sessionId) => {
    try {
      const sessionDoc = await getDoc(doc(db, "sessions", sessionId));
      if (sessionDoc.exists()) {
        setChat(sessionDoc.data().messages);
        setCurrentSessionId(sessionId);
        setMode("text");
        setActiveSection("home");
      }
    } catch (error) {
      console.error("Error loading session:", error);
    }
  };

  const handleSaveName = async (name) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { 
        name: name,
        email: user.email,
        updatedAt: Timestamp.fromDate(new Date())
      }, { merge: true });
      
      // Update local state
      setUserProfile(prev => ({ ...prev, name }));
      setShowNameInputPopup(false);
      setNotification({
        message: `Welcome, ${name}! Your name has been saved.`,
        type: "success",
      });
    } catch (error) {
      console.error("Error saving name:", error);
      setNotification({
        message: "Failed to save your name. Please try again.",
        type: "error",
      });
    }
  };

  const handleEndSessionConfirm = async () => {
    if (chat.length > 1) {
      await saveSession(chat);
    }
    handleBackToModeSelect();
    setShowEndSessionPopup(false);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.text.trim() || !user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "feedback"), {
        userId: user.uid,
        email: user.email,
        feedback: feedback.text,
        submittedAt: Timestamp.fromDate(new Date()),
      });
      setFeedback({ text: "", submitted: true });
      setNotification({
        message: "Thank you for your feedback!",
        type: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert(
        "Sorry, there was an issue submitting your feedback. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetHistory = async () => {
    if (!user) return;
    setLoading(true);
    const batch = writeBatch(db);
    const sessionsQuery = query(
      collection(db, "sessions"),
      where("userId", "==", user.uid)
    );
    const querySnapshot = await getDocs(sessionsQuery);
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    setSessionHistory([]);
    setShowResetPopup(false);
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Delete Firestore data
      await handleResetHistory(); // Deletes sessions
      await deleteDoc(doc(db, "users", user.uid));
      // You might want to delete feedback too

      // Delete user from Firebase Auth
      try {
        await deleteUser(auth.currentUser);
        navigate("/");
        alert("Account deleted successfully.");
      } catch (deleteError) {
        if (deleteError.code === "auth/requires-recent-login") {
          const password = prompt(
            "For security, please enter your password to confirm account deletion:"
          );
          if (!password) {
            alert("Account deletion cancelled.");
            return;
          }
          try {
            const credential = EmailAuthProvider.credential(
              user.email,
              password
            );
            await reauthenticateWithCredential(auth.currentUser, credential);
            await deleteUser(auth.currentUser);
            navigate("/");
            alert("Account deleted successfully.");
          } catch (reauthError) {
            alert(
              "Re-authentication failed. Please check your password and try again."
            );
          }
        } else {
          alert(
            "Account deletion failed. Please try again or contact support."
          );
        }
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      // Handle specific errors like re-authentication needed
    } finally {
      setLoading(false);
      setShowDeletePopup(false);
    }
  };

  // Auto-dismiss notification after 3 seconds
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(
        () => setNotification({ message: "", type: "" }),
        3000
      );
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Auto-reset loading if stuck for more than 10 seconds
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setLoading(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat, loading]);

  // Helper to count sessions by mode for current month
  const getMonthlySessionCounts = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    let voiceCount = 0;
    let textCount = 0;
    sessionHistory.forEach((session) => {
      // Defensive: check for createdAt
      let dateObj = session.createdAt?.toDate
        ? session.createdAt.toDate()
        : new Date(session.createdAt);
      if (
        !isNaN(dateObj) &&
        dateObj.getMonth() === currentMonth &&
        dateObj.getFullYear() === currentYear
      ) {
        // Heuristic: if any message in session is from 'user' and session.mode === 'voice' or 'text'
        // But if you don't store mode, infer from message content or add mode to sessionData in the future
        // For now, assume sessions with more than 1 message and the first message is from assistant are text unless you have a mode field
        if (session.mode === "voice") {
          voiceCount++;
        } else {
          textCount++;
        }
      }
    });
    return { voiceCount, textCount };
  };
  const { voiceCount, textCount } = getMonthlySessionCounts();
  const VOICE_LIMIT = 5;

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        Loading...
      </div>
    );
  }

  return (
    <div
      className={`flex w-full min-h-screen transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-900/50" : "bg-gray-50/50"
      }`}
    >
      {/* Notification Popup */}
      {notification.message && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-2 rounded-lg shadow-lg font-medium text-sm transition-all duration-300 ${
            notification.type === "success"
              ? theme === "dark"
                ? "bg-emerald-600 text-white border border-emerald-500"
                : "bg-emerald-100 text-emerald-800 border border-emerald-300"
              : theme === "dark"
              ? "bg-red-600 text-white border border-red-500"
              : "bg-red-100 text-red-800 border border-red-300"
          }
          animate-slide-in-right
        `}
          style={{ minWidth: 180, maxWidth: 280 }}
        >
          {notification.message}
        </div>
      )}

      {/* End Session Popup */}
      {showEndSessionPopup && (
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div
            className={`relative rounded-xl shadow-lg w-full max-w-sm transition-all duration-300 transform animate-scale-in m-4 ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2
                  className={`text-lg font-bold lowercase ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  end the session?
                </h2>
                <button
                  onClick={() => setShowEndSessionPopup(false)}
                  className={`text-gray-400 hover:text-gray-600 transition-colors ${
                    theme === "dark" && "hover:text-gray-200"
                  }`}
                >
                  <X size={20} />
                </button>
              </div>
              <p
                className={`mb-6 text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                This will end your current conversation and save it to your
                session history. Are you sure?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowEndSessionPopup(false)}
                  className={`px-5 py-2 text-sm rounded-lg font-semibold transition-colors ${
                    theme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }`}
                >
                  cancel
                </button>
                <button
                  onClick={handleEndSessionConfirm}
                  className="px-5 py-2 text-sm rounded-lg bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold transition-colors"
                >
                  confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Popup */}
      {showResetPopup && (
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div
            className={`relative rounded-xl shadow-lg w-full max-w-sm transition-all duration-300 transform animate-scale-in m-4 ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2
                  className={`text-lg font-bold lowercase ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  reset history?
                </h2>
                <button
                  onClick={() => setShowResetPopup(false)}
                  className={`text-gray-400 hover:text-gray-600 transition-colors ${
                    theme === "dark" && "hover:text-gray-200"
                  }`}
                >
                  <X size={20} />
                </button>
              </div>
              <p
                className={`mb-6 text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                This will permanently delete all your past conversations. This
                action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowResetPopup(false)}
                  disabled={loading}
                  className={`px-5 py-2 text-sm rounded-lg font-semibold transition-colors ${
                    theme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }`}
                >
                  cancel
                </button>
                <button
                  onClick={handleResetHistory}
                  disabled={loading}
                  className="px-5 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                >
                  {loading ? "resetting..." : "reset"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Popup */}
      {showDeletePopup && (
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div
            className={`relative rounded-xl shadow-lg w-full max-w-sm transition-all duration-300 transform animate-scale-in m-4 ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2
                  className={`text-lg font-bold lowercase ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  delete account?
                </h2>
                <button
                  onClick={() => setShowDeletePopup(false)}
                  className={`text-gray-400 hover:text-gray-600 transition-colors ${
                    theme === "dark" && "hover:text-gray-200"
                  }`}
                >
                  <X size={20} />
                </button>
              </div>
              <p
                className={`mb-6 text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                This will permanently delete your account and all related data.
                This action is final.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeletePopup(false)}
                  disabled={loading}
                  className={`px-5 py-2 text-sm rounded-lg font-semibold transition-colors ${
                    theme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }`}
                >
                  cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="px-5 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                >
                  {loading ? "deleting..." : "delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input End Session Popup */}
      {showInputEndSessionPopup && (
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div
            className={`relative rounded-xl shadow-lg w-full max-w-sm transition-all duration-300 transform animate-scale-in m-4 bg-white dark:bg-gray-800`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2
                  className={`text-lg font-bold lowercase text-gray-900 dark:text-white`}
                >
                  end the session?
                </h2>
                <button
                  onClick={() => setShowInputEndSessionPopup(false)}
                  className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors`}
                >
                  <X size={20} />
                </button>
              </div>
              <p
                className={`mb-6 text-sm text-gray-600 dark:text-gray-400`}
              >
                are you 100% sure you want to end the session?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowInputEndSessionPopup(false)}
                  className={`px-5 py-2 text-sm rounded-lg font-semibold transition-colors bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white`}
                >
                  cancel
                </button>
                <button
                  onClick={async () => {
                    await saveSession(chat);
                    setChat([
                      {
                        sender: "assistant",
                        message:
                          "alright, hi! so—where do we want to start today? what's been on your mind lately?",
                      },
                    ]);
                    setCurrentSessionId(null);
                    setShowInputEndSessionPopup(false);
                    setNotification({
                      message: "Session ended and saved!",
                      type: "success",
                    });
                  }}
                  className="px-5 py-2 text-sm rounded-lg bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold transition-colors"
                >
                  confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        setMode={setMode}
        handleLogout={handleLogout}
      />

      {/* Main Content */}
      <main
        className={`flex-1 flex flex-col relative p-6 md:p-8 overflow-y-auto ml-[80px] transition-colors duration-300 ${
          theme === "dark" ? "bg-gray-900/50" : "bg-gray-50/50"
        }`}
      >
        {activeSection === "home" && mode === null && (
          <div className="absolute top-6 right-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium transition-colors duration-300 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {theme === "dark" ? "dark mode" : "light mode"}
              </span>
              <button
                onClick={toggleTheme}
                className={`w-11 h-6 flex items-center rounded-full transition-colors ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full shadow transform transition-transform flex items-center justify-center ${
                    theme === "dark"
                      ? "translate-x-5 bg-gray-800"
                      : "translate-x-1 bg-white"
                  }`}
                >
                  {theme === "dark" ? (
                    <Moon size={12} className="text-gray-300" />
                  ) : (
                    <Sun size={12} className="text-yellow-600" />
                  )}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Content Sections */}
        {activeSection !== "home" || mode === null ? (
          <ContentSections
            activeSection={activeSection}
            theme={theme}
            toggleTheme={toggleTheme}
            user={user}
            userProfile={userProfile}
            handleLogout={handleLogout}
            sessionHistory={sessionHistory}
            totalMessages={totalMessages}
            voiceCount={voiceCount}
            textCount={textCount}
            VOICE_LIMIT={VOICE_LIMIT}
            analyticsCookies={analyticsCookies}
            setAnalyticsCookies={setAnalyticsCookies}
            setShowResetPopup={setShowResetPopup}
            setShowDeletePopup={setShowDeletePopup}
            loading={loading}
            handleResetHistory={handleResetHistory}
            handleDeleteAccount={handleDeleteAccount}
            feedbackText={feedback.text}
            setFeedbackText={setFeedback.text}
            feedbackSubmitted={feedback.submitted}
            setFeedbackSubmitted={setFeedback.submitted}
            handleFeedbackSubmit={handleFeedbackSubmit}
            loadSession={loadSession}
            deleteDoc={deleteDoc}
            doc={doc}
            db={db}
            setSessionHistory={setSessionHistory}
            setNotification={setNotification}
            mode={mode}
            setMode={setMode}
            chat={chat}
            setChat={setChat}
            currentSessionId={currentSessionId}
            setCurrentSessionId={setCurrentSessionId}
            setShowInputEndSessionPopup={setShowInputEndSessionPopup}
            saveSession={saveSession}
          />
        ) : (
          <ChatInterface
            user={user}
            mode={mode}
            setMode={setMode}
            chat={chat}
            setChat={setChat}
            currentSessionId={currentSessionId}
            setCurrentSessionId={setCurrentSessionId}
            setShowEndSessionPopup={setShowEndSessionPopup}
            setShowInputEndSessionPopup={setShowInputEndSessionPopup}
            setNotification={setNotification}
            setLoading={setLoading}
            loading={loading}
            sessionHistory={sessionHistory}
            setSessionHistory={setSessionHistory}
            saveSession={saveSession}
          />
        )}
      </main>

      {/* Name Input Popup */}
      <NameInputPopup
        isOpen={showNameInputPopup}
        onClose={() => setShowNameInputPopup(false)}
        onSubmit={handleSaveName}
        userName={userProfile?.name || ''}
      />
    </div>
  );
}

export default Home;
