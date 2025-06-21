import React, { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth, db } from "../firebase";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { Mic, Keyboard, X, ArrowUp, MessageCircle } from "lucide-react";
import { useTheme } from "../App";
import { API_KEYS, VOICE_SETTINGS } from "../config/api";

// Initialize Google Generative AI with API key from config
const genAI = new GoogleGenerativeAI(API_KEYS.GEMINI_API_KEY);

function ChatInterface({
  user,
  mode,
  setMode,
  chat,
  setChat,
  currentSessionId,
  setCurrentSessionId,
  setShowEndSessionPopup,
  setShowInputEndSessionPopup,
  setNotification,
  setLoading,
  loading,
  sessionHistory,
  setSessionHistory,
  saveSession,
}) {
  const { theme } = useTheme();
  const [textInput, setTextInput] = useState("");
  const [voiceState, setVoiceState] = useState("idle");
  const [animatedSubtitle, setAnimatedSubtitle] = useState("");
  const [showYourTurn, setShowYourTurn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasShownInitialGreeting, setHasShownInitialGreeting] = useState(false);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const subtitleIntervalRef = useRef(null);
  const chatEndRef = useRef(null);
  const hasShownGreetingRef = useRef(false);
  const [userProfile, setUserProfile] = useState(null);
  const [aiLanguage, setAiLanguage] = useState("english"); // 'english' or 'hindi'

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

Never include greetings or farewells. Focus only on the user’s message and respond directly with compassion and clarity.

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

  const generateGreeting = async () => {
    try {
      const greetingPrompt = `You are a warm, empathetic therapist starting a new conversation. Generate a natural, welcoming greeting (1-2 sentences) that feels conversational and inviting. Don't be overly formal - speak like a caring friend who's genuinely interested. Avoid generic phrases like "what's been on your mind lately" - be more specific and warm.`;

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-latest",
      });

      const result = await model.generateContent(greetingPrompt);
      const greeting = await result.response.text();
      return greeting;
    } catch (error) {
      console.error("Error generating greeting:", error);
      // Fallback to a simple, natural greeting
      return "Hi there! I'm here to listen and support you. What would you like to talk about?";
    }
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

  const handleMicClick = () => {
    console.log("Mic button clicked. Current voiceState:", voiceState);
    if (voiceState === "speaking" || voiceState === "listening") {
      // Stop both speech synthesis and recognition if active
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        console.log("Stopped speech recognition.");
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
    console.log("Started speech recognition. Waiting for user to speak...");
    recognitionRef.current.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("Speech recognized:", transcript);
      setVoiceState("idle");
      setShowYourTurn(false);
      const userMsg = { sender: "user", message: transcript };
      const newChat = [...chat, userMsg];
      setChat(newChat);
      setLoading(true);
      try {
        console.log("Calling AI with new chat history...");
        const aiText = await getGeminiResponse(newChat);
        console.log("AI responded:", aiText);
        const finalChat = [
          ...newChat,
          { sender: "assistant", message: aiText },
        ];
        setChat(finalChat);
        speakWithSubtitle(aiText);
        // Remove automatic session saving - only save when user ends session
      } catch (err) {
        console.error("Error getting AI response after speech:", err);
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
    recognitionRef.current.onerror = (e) => {
      console.error("Speech recognition error:", e);
      setVoiceState("idle");
    };
    recognitionRef.current.onend = () => {
      console.log("Speech recognition ended.");
      setVoiceState("idle");
    };
    recognitionRef.current.start();
  };

  const speakWithSubtitle = async (text) => {
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

    try {
      console.log("ElevenLabs TTS - Starting with text:", text);
      console.log("ElevenLabs TTS - Voice ID:", API_KEYS.ELEVENLABS_VOICE_ID);
      console.log(
        "ElevenLabs TTS - API Key:",
        API_KEYS.ELEVENLABS_API_KEY.substring(0, 10) + "..."
      );

      // Use ElevenLabs API for high-quality female voice
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${API_KEYS.ELEVENLABS_VOICE_ID}`,
        {
          method: "POST",
          headers: {
            Accept: "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": API_KEYS.ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: text,
            model_id: "eleven_multilingual_v2",
            voice_settings: VOICE_SETTINGS,
          }),
        }
      );

      console.log("ElevenLabs response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ElevenLabs error response:", errorText);
        console.error("Full error details:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          errorText: errorText,
        });
        throw new Error(
          `ElevenLabs API error: ${response.status} - ${errorText}`
        );
      }

      const audioBlob = await response.blob();
      console.log("Audio blob received, size:", audioBlob.size);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      console.log("Audio element created, attempting to play...");

      audio.onended = () => {
        console.log("ElevenLabs audio playback completed");
        setVoiceState("idle");
        setAnimatedSubtitle(text); // Show full text after speaking
        setShowYourTurn(true);
        URL.revokeObjectURL(audioUrl); // Clean up the blob URL

        // Automatically start listening for the next user input
        // Only in voice mode, not for first message
        if (mode === "voice") {
          console.log(
            "Auto-starting speech recognition after ElevenLabs playback"
          );
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
            setShowYourTurn(false);
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
            recognitionRef.current.onerror = () => setVoiceState("idle");
            recognitionRef.current.onend = () => setVoiceState("idle");
            recognitionRef.current.start();
          }, 400);
        }
      };

      audio.onerror = (error) => {
        console.error("ElevenLabs audio playback error:", error);
        setVoiceState("idle");
        setAnimatedSubtitle(text);
        setShowYourTurn(true);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
      console.log("ElevenLabs audio playback started successfully");
    } catch (error) {
      console.error("Error with ElevenLabs TTS:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        voiceId: API_KEYS.ELEVENLABS_VOICE_ID,
        apiKeyPrefix: API_KEYS.ELEVENLABS_API_KEY.substring(0, 10),
      });
      console.log("Falling back to browser speech synthesis...");
      // Fallback to browser speech synthesis if ElevenLabs fails
      if ("speechSynthesis" in window) {
        const utter = new window.SpeechSynthesisUtterance(text);
        // Try to set a female voice
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(
          (voice) =>
            voice.lang.includes("en") &&
            voice.name.toLowerCase().includes("female")
        );
        if (femaleVoice) {
          utter.voice = femaleVoice;
        }

        utter.onend = () => {
          console.log("Browser speech synthesis completed");
          setVoiceState("idle");
          setAnimatedSubtitle(text);
          setShowYourTurn(true);
          // Auto-listen logic here (same as above)
          if (mode === "voice") {
            console.log(
              "Auto-starting speech recognition after browser synthesis"
            );
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
              setShowYourTurn(false);
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
                  // Remove automatic session saving - only save when user ends session
                } catch (err) {
                  setChat((prev) => [
                    ...prev,
                    {
                      sender: "assistant",
                      message:
                        "Sorry, I am having trouble responding right now.",
                    },
                  ]);
                } finally {
                  setLoading(false);
                }
              };
              recognitionRef.current.onerror = () => setVoiceState("idle");
              recognitionRef.current.onend = () => setVoiceState("idle");
              recognitionRef.current.start();
            }, 400);
          }
        };
        window.speechSynthesis.speak(utter);
      }
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
    if (mode === "voice" && !hasShownGreetingRef.current && chat.length === 0) {
      console.log("Entering voice mode, showing initial greeting...");
      setAnimatedSubtitle("");
      setShowYourTurn(false);
      setVoiceState("speaking");
      setIsConnecting(true);
      hasShownGreetingRef.current = true;

      (async () => {
        try {
          // Generate a dynamic greeting using the AI
          const initialGreeting = await generateGreeting();

          // Set the chat with the greeting
          setChat([{ sender: "assistant", message: initialGreeting }]);

          await speakWithSubtitle(initialGreeting);
        } catch (error) {
          console.error("Error showing initial greeting:", error);
          // Fallback to a simple greeting if AI generation fails
          const fallbackGreeting =
            "Hi there! I'm here to listen and support you. What would you like to talk about?";
          setChat([{ sender: "assistant", message: fallbackGreeting }]);
          await speakWithSubtitle(fallbackGreeting);
        } finally {
          setIsConnecting(false);
        }
      })();
    }
    // eslint-disable-next-line
  }, [mode, chat.length]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat, loading]);

  if (mode === "voice") {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="text-center mb-6">
          <p
            className={`text-xl font-semibold transition-colors duration-300 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
            style={{ minHeight: "2.5rem" }}
          >
            {isConnecting
              ? "connecting..."
              : voiceState === "listening"
              ? "listening..."
              : loading
              ? "thinking..."
              : showYourTurn
              ? "your turn"
              : chat.length === 0
              ? "ready"
              : ""}
          </p>
        </div>
        <div className="relative flex items-center justify-center w-48 h-48 mb-12">
          <div
            className={`absolute inset-0 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-transform duration-500 ${
              isConnecting ? "animate-pulse scale-110" : ""
            } ${voiceState === "listening" ? "scale-110" : ""} ${
              voiceState === "speaking" ? "animate-pulse" : ""
            }`}
          ></div>
        </div>
        {/* Subtitle/message below the circle */}
        <div className="w-full flex justify-center mb-8 min-h-[2.5rem]">
          <span
            className={`text-md text-center max-w-2xl block transition-colors duration-300 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {isConnecting
              ? "Reaching out to you..."
              : voiceState === "speaking" && animatedSubtitle
              ? animatedSubtitle
              : (() => {
                  if (loading) {
                    const lastAssistant = [...chat]
                      .reverse()
                      .find((m) => m.sender === "assistant");
                    return lastAssistant ? lastAssistant.message : null;
                  }
                  if (voiceState === "listening") {
                    const lastUser = [...chat]
                      .reverse()
                      .find((m) => m.sender === "user");
                    return lastUser ? lastUser.message : null;
                  }
                  if (voiceState === "idle" || voiceState === "speaking") {
                    const lastAssistant = [...chat]
                      .reverse()
                      .find((m) => m.sender === "assistant");
                    return lastAssistant ? lastAssistant.message : null;
                  }
                  return null;
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
                isConnecting
                  ? "bg-gray-300 cursor-not-allowed"
                  : voiceState === "listening"
                  ? "border-2 border-yellow-400 bg-white animate-pulse"
                  : "bg-yellow-400"
              }
            `}
            title="Start/Stop Listening"
            onClick={handleMicClick}
            disabled={isConnecting}
          >
            {voiceState === "listening" ? (
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: "#fde047", // Tailwind yellow-400
                  borderRadius: 4,
                  display: "block",
                  animation: "pulse 1s infinite",
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
    );
  }

  if (mode === "text") {
    return (
      <div
        className="w-full max-w-2xl mx-auto flex flex-col"
        style={{ height: "80vh" }}
      >
        <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={chatEndRef}>
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
                <div className="text-base leading-relaxed">{msg.message}</div>
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
    );
  }

  return null;
}

export default ChatInterface;
