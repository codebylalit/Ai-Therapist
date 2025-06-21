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

// IMPORTANT: Replace with your actual API key, preferably from environment variables
const genAI = new GoogleGenerativeAI("AIzaSyA4LQ-Ic5Mo35NJ-ECVq3okfbw31uQSrcs");

function Home() {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeSection, setActiveSection] = useState("home");
  const [mode, setMode] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [chat, setChat] = useState([
    {
      sender: "assistant",
      message:
        "alright, hi! so—where do we want to start today? what's been on your mind lately?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [voiceState, setVoiceState] = useState("idle");
  const [sessionHistory, setSessionHistory] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showEndSessionPopup, setShowEndSessionPopup] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);
  const [analyticsCookies, setAnalyticsCookies] = useState(false);
  const [showResetPopup, setShowResetPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const [animatedSubtitle, setAnimatedSubtitle] = useState("");
  const subtitleIntervalRef = useRef(null);
  const [showYourTurn, setShowYourTurn] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const chatEndRef = useRef(null);
  const [showInputEndSessionPopup, setShowInputEndSessionPopup] =
    useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
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
    let prompt = `You are a compassionate, emotionally supportive AI therapist. Respond with empathy, warmth, and validation. Keep your response concise (2-4 sentences), focused on emotional support, encouragement, and actionable next steps if appropriate. Avoid long explanations. Speak naturally, like a real human therapist specializing in mental health.`;
    if (mode === "voice") {
      prompt +=
        ' Always start your response with a natural, friendly greeting (like "Hello", "Nice to see you again", "Welcome back", "Hi there", etc.) that feels real and emotionally warm.';
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
      await saveSession(finalChat);
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

  const handleMicClick = () => {
    if (voiceState === "speaking" || voiceState === "listening") {
      // Stop both speech synthesis and recognition if active
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (subtitleIntervalRef.current) {
        clearInterval(subtitleIntervalRef.current);
      }
      setVoiceState("idle");
      setAnimatedSubtitle("");
      setShowYourTurn(false);
      return;
    }
    // If idle, start listening
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-US";
    setVoiceState("listening");
    recognitionRef.current.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setVoiceState("idle");
      setShowYourTurn(false);
      const userMsg = { sender: "user", message: transcript };
      const newChat = [...chat, userMsg];
      setChat(newChat);
      setLoading(true);
      try {
        const aiText = await getGeminiResponse(newChat);
        const finalChat = [
          ...newChat,
          { sender: "assistant", message: aiText },
        ];
        setChat(finalChat);
        // Animate subtitle word by word as it speaks
        speakWithSubtitle(aiText);
        await saveSession(finalChat);
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
    recognitionRef.current.onerror = () => setVoiceState("idle");
    recognitionRef.current.onend = () => setVoiceState("idle");
    recognitionRef.current.start();
  };

  const speakWithSubtitle = (text) => {
    if (subtitleIntervalRef.current) {
      clearInterval(subtitleIntervalRef.current);
    }
    setVoiceState("speaking");
    setAnimatedSubtitle("");
    setShowYourTurn(false);
    const words = text.split(" ");
    let idx = 0;
    subtitleIntervalRef.current = setInterval(() => {
      setAnimatedSubtitle(words.slice(0, idx + 1).join(" "));
      idx++;
      if (idx >= words.length) {
        clearInterval(subtitleIntervalRef.current);
      }
    }, 60); // 60ms per word for smooth effect
    if ("speechSynthesis" in window) {
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.onend = () => {
        setVoiceState("idle");
        setAnimatedSubtitle(text); // Show full text after speaking
        setShowYourTurn(true);
        // Automatically start listening for the next user input
        if (mode === "voice") {
          setTimeout(() => {
            if (
              !(
                "webkitSpeechRecognition" in window ||
                "SpeechRecognition" in window
              )
            ) {
              alert("Speech recognition is not supported in this browser.");
              return;
            }
            const SpeechRecognition =
              window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.lang = "en-US";
            setVoiceState("listening");
            recognitionRef.current.onresult = async (event) => {
              const transcript = event.results[0][0].transcript;
              setVoiceState("idle");
              setShowYourTurn(false);
              const userMsg = { sender: "user", message: transcript };
              const newChat = [...chat, userMsg];
              setChat(newChat);
              setLoading(true);
              try {
                const aiText = await getGeminiResponse(newChat);
                const finalChat = [
                  ...newChat,
                  { sender: "assistant", message: aiText },
                ];
                setChat(finalChat);
                speakWithSubtitle(aiText);
                await saveSession(finalChat);
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
            recognitionRef.current.onerror = () => setVoiceState("idle");
            recognitionRef.current.onend = () => setVoiceState("idle");
            recognitionRef.current.start();
          }, 400); // short delay after speaking
        }
      };
      window.speechSynthesis.speak(utter);
    }
  };

  const handleBackToModeSelect = () => {
    setMode(null);
    setChat([
      {
        sender: "assistant",
        message:
          "alright, hi! so—where do we want to start today? what's been on your mind lately?",
      },
    ]);
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

  const stopAllAudio = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setVoiceState("idle");
  };

  const handleEndSessionConfirm = () => {
    stopAllAudio();
    handleBackToModeSelect();
    setShowEndSessionPopup(false);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim() || !user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "feedback"), {
        userId: user.uid,
        email: user.email,
        feedback: feedbackText,
        submittedAt: Timestamp.fromDate(new Date()),
      });
      setFeedbackSubmitted(true);
      setFeedbackText("");
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

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (subtitleIntervalRef.current) {
        clearInterval(subtitleIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Every time the user enters voice mode, get a greeting from AI based on chat context
    if (mode === "voice") {
      setAnimatedSubtitle("");
      setShowYourTurn(false);
      setVoiceState("speaking");
      (async () => {
        const aiText = await getGeminiResponse(chat);
        setChat((prev) => [...prev, { sender: "assistant", message: aiText }]);
        speakWithSubtitle(aiText);
      })();
    }
    // eslint-disable-next-line
  }, [mode]);

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

  return (
    <div
      className={`flex w-full min-h-screen transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-900/50" : "bg-gray-50/50"
      }`}
    >
      {/* Notification Popup */}
      {notification.message && (
        <div
          className={`fixed bottom-8 right-8 z-50 px-6 py-3 rounded-xl shadow-lg font-semibold text-lg transition-all
          ${
            notification.type === "success"
              ? theme === "dark"
                ? "bg-green-900 text-green-200 border border-green-700"
                : "bg-green-100 text-green-800 border border-green-300"
              : theme === "dark"
              ? "bg-red-900 text-red-200 border border-red-700"
              : "bg-red-100 text-red-800 border border-red-300"
          }
          animate-slide-in-right
        `}
          style={{ minWidth: 220 }}
        >
          {notification.message}
        </div>
      )}

      {/* End Session Popup */}
      {showEndSessionPopup && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
          <div
            className={`rounded-xl shadow-lg p-8 w-full max-w-sm text-center transition-colors duration-300 ${
              theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-800"
            }`}
          >
            <h2 className="text-2xl font-bold mb-4">End Session?</h2>
            <p
              className={`mb-8 ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              This will end your current conversation and save it to your
              session history. Are you sure?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowEndSessionPopup(false)}
                className={`px-8 py-2.5 rounded-lg font-bold transition-colors ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleEndSessionConfirm}
                className="px-8 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold transition-colors"
              >
                End
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Popup */}
      {showResetPopup && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
          <div
            className={`rounded-xl shadow-lg p-8 w-full max-w-sm text-center transition-colors duration-300 ${
              theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-800"
            }`}
          >
            <h2 className="text-2xl font-bold mb-4">Reset History?</h2>
            <p
              className={`mb-8 ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              This will permanently delete all your past conversations. This
              action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowResetPopup(false)}
                disabled={loading}
                className={`px-8 py-2.5 rounded-lg font-bold ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleResetHistory}
                disabled={loading}
                className="px-8 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold"
              >
                {loading ? "Resetting..." : "Reset"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Popup */}
      {showDeletePopup && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
          <div
            className={`rounded-xl shadow-lg p-8 w-full max-w-sm text-center transition-colors duration-300 ${
              theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-800"
            }`}
          >
            <h2 className="text-2xl font-bold mb-4">Delete Account?</h2>
            <p
              className={`mb-8 ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              This will permanently delete your account and all related data.
              This action is final.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeletePopup(false)}
                disabled={loading}
                className={`px-8 py-2.5 rounded-lg font-bold ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="px-8 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input End Session Popup */}
      {showInputEndSessionPopup && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
          <div
            className={`rounded-xl shadow-lg p-8 w-full max-w-sm text-center transition-colors duration-300 ${
              theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-800"
            }`}
          >
            <h2 className="text-2xl font-bold mb-4">End Session?</h2>
            <p
              className={`mb-8 ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              This will end your current conversation and save it to your
              session history. Are you sure?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowInputEndSessionPopup(false)}
                className={`px-8 py-2.5 rounded-lg font-bold transition-colors ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                Cancel
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
                className="px-8 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold transition-colors"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
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
            <button
              className={`transition-colors duration-300 ${
                theme === "dark"
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>
        )}

        {/* === SECTIONS START === */}
        {activeSection === "profile" && (
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
                    {user.email}
                  </p>
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
        )}

        {activeSection === "history" && (
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
        )}

        {activeSection === "sparkle" && (
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
        )}

        {activeSection === "feedback" && (
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
        )}

        {activeSection === "home" && (
          <>
            {mode === null && (
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-all ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                        : "bg-white border-gray-200/80 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setMode("voice");
                      setLoading(false);
                      setVoiceState("idle");
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-all ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                        : "bg-white border-gray-200/80 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setMode("text");
                      setLoading(false);
                      setVoiceState("idle");
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
            )}

            {mode === "voice" && (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <div className="text-center mb-6">
                  <p
                    className={`text-xl font-semibold transition-colors duration-300 ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                    style={{ minHeight: "2.5rem" }}
                  >
                    {voiceState === "listening"
                      ? "listening..."
                      : loading
                      ? "thinking..."
                      : showYourTurn
                      ? "your turn"
                      : ""}
                  </p>
                </div>
                <div className="relative flex items-center justify-center w-52 h-52 mb-8">
                  <div
                    className={`absolute inset-0 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-transform duration-500 ${
                      voiceState === "listening" ? "scale-110" : ""
                    } ${voiceState === "speaking" ? "animate-pulse" : ""}`}
                  ></div>
                </div>
                {/* Subtitle/message below the circle */}
                <div className="w-full flex justify-center mb-8 min-h-[2.5rem]">
                  <span
                    className={`text-lg text-center max-w-2xl block transition-colors duration-300 ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {voiceState === "speaking" && animatedSubtitle
                      ? animatedSubtitle
                      : (() => {
                          if (chat.length === 0) return null;
                          if (loading) {
                            const lastAssistant = [...chat]
                              .reverse()
                              .find((m) => m.sender === "assistant");
                            return lastAssistant ? lastAssistant.message : null;
                          }
                          if (
                            voiceState === "listening" ||
                            voiceState === "idle"
                          ) {
                            const lastUser = [...chat]
                              .reverse()
                              .find((m) => m.sender === "user");
                            return lastUser ? lastUser.message : null;
                          }
                          const lastAssistant = [...chat]
                            .reverse()
                            .find((m) => m.sender === "assistant");
                          return lastAssistant ? lastAssistant.message : null;
                        })()}
                  </span>
                </div>
                <div className="flex gap-10 items-center mt-10">
                  <button
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                      theme === "dark"
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                    title="Switch to text mode"
                    onClick={() => setMode("text")}
                  >
                    <MessageCircle
                      size={20}
                      className={`transition-colors duration-300 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    />
                  </button>
                  <button
                    className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors
                      ${
                        voiceState === "listening"
                          ? "border-2 border-yellow-400 bg-white"
                          : "bg-yellow-400"
                      }
                    `}
                    title="Start/Stop Listening"
                    onClick={handleMicClick}
                  >
                    {voiceState === "listening" ? (
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          backgroundColor: "#fde047", // Tailwind yellow-400
                          borderRadius: 4,
                          display: "block",
                        }}
                      />
                    ) : (
                      <Mic size={24} className="text-black" />
                    )}
                  </button>
                  <button
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                      theme === "dark"
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                    title="End Session"
                    onClick={() => setShowEndSessionPopup(true)}
                  >
                    <X
                      size={20}
                      className={`transition-colors duration-300 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {mode === "text" && (
              <div
                className="w-full max-w-2xl mx-auto flex flex-col"
                style={{ height: "80vh" }}
              >
                <div
                  className="flex-1 overflow-y-auto p-4 space-y-6"
                  ref={chatEndRef}
                >
                  {chat.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex items-end gap-3 ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.sender === "assistant" && (
                        <div className="w-12 h-12 rounded-full bg-yellow-400 flex-shrink-0 shadow-md"></div>
                      )}
                      <div
                        className={`relative px-6 py-4 max-w-[75%] break-words shadow-lg transition-all
                          ${
                            msg.sender === "assistant"
                              ? theme === "dark"
                                ? "bg-gray-800 text-white rounded-2xl rounded-tl-lg border border-gray-700"
                                : "bg-white text-gray-800 rounded-2xl rounded-tl-lg border border-gray-100"
                              : "bg-yellow-100 text-yellow-900 rounded-2xl rounded-br-lg"
                          }
                        `}
                        style={{
                          boxShadow:
                            msg.sender === "assistant"
                              ? theme === "dark"
                                ? "0 2px 12px 0 rgba(0,0,0,0.3)"
                                : "0 2px 12px 0 rgba(0,0,0,0.06)"
                              : undefined,
                        }}
                      >
                        <div className="text-base leading-relaxed">
                          {msg.message}
                        </div>
                        <div
                          className={`text-xs mt-1 text-right transition-colors duration-300 ${
                            theme === "dark" ? "text-gray-400" : "text-gray-400"
                          }`}
                        >
                          {new Date().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      {msg.sender === "user" && (
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex-shrink-0 shadow-md"></div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="flex items-end gap-3 justify-start">
                      <div className="w-12 h-12 rounded-full bg-yellow-400 flex-shrink-0 shadow-md"></div>
                      <div className="flex items-center">
                        <div
                          className={`rounded-xl px-4 py-2 shadow border flex items-center gap-1 min-w-[40px] ${
                            theme === "dark"
                              ? "bg-gray-800 border-gray-700"
                              : "bg-white border-gray-100"
                          }`}
                        >
                          <span
                            className={`block w-2 h-2 rounded-full animate-bounce [animation-delay:0ms] ${
                              theme === "dark" ? "bg-gray-300" : "bg-gray-800"
                            }`}
                          ></span>
                          <span
                            className={`block w-2 h-2 rounded-full animate-bounce [animation-delay:150ms] ${
                              theme === "dark" ? "bg-gray-300" : "bg-gray-800"
                            }`}
                          ></span>
                          <span
                            className={`block w-2 h-2 rounded-full animate-bounce [animation-delay:300ms] ${
                              theme === "dark" ? "bg-gray-300" : "bg-gray-800"
                            }`}
                          ></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef}></div>
                </div>
                <form
                  className={`w-full flex items-center gap-2 p-4 rounded-b-2xl border-t shadow-md transition-colors duration-300 ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-100"
                  }`}
                  style={{ minHeight: 64 }}
                  onSubmit={handleTextSend}
                >
                  <button
                    type="button"
                    className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors text-xl font-bold ${
                      theme === "dark"
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                    }`}
                    title="Clear"
                    onClick={() => setShowInputEndSessionPopup(true)}
                    tabIndex={-1}
                  >
                    ×
                  </button>
                  <input
                    type="text"
                    className={`flex-1 w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-shadow ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "border-gray-200 bg-white text-gray-800 placeholder-gray-500"
                    }`}
                    placeholder="type your message..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    disabled={loading}
                    ref={inputRef}
                  />
                  <button
                    type="submit"
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-yellow-50 hover:bg-yellow-100 transition-colors disabled:bg-gray-100"
                    title="Send"
                    disabled={loading || !textInput.trim()}
                  >
                    <ArrowUp size={24} className="text-yellow-400" />
                  </button>
                </form>
              </div>
            )}
          </>
        )}
        {/* === SECTIONS END === */}
      </main>
    </div>
  );
}

export default Home;
