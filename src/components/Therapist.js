import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import './App.css';

const genAI = new GoogleGenerativeAI("AIzaSyA4LQ-Ic5Mo35NJ-ECVq3okfbw31uQSrcs");

function Therapist() {
  const [messages, setMessages] = useState([]); // {role: 'user'|'ai', text: string}
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [circleState, setCircleState] = useState('idle'); // idle | listening | speaking
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Voice input (Speech-to-Text)
  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setCircleState('listening');
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setCircleState('idle');
      inputRef.current?.focus();
    };
    recognition.onerror = () => {
      setCircleState('idle');
    };
    recognition.onend = () => {
      setCircleState('idle');
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  // Voice output (Text-to-Speech)
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      setCircleState('speaking');
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      utter.rate = 1.02;
      utter.pitch = 1.1;
      utter.onend = () => setCircleState('idle');
      window.speechSynthesis.speak(utter);
    }
  };

  const handleInputChange = (e) => setInput(e.target.value);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setCircleState('speaking'); // prepping for AI response
    try {
      // Compose conversation history for context
      const history = [...messages, userMessage]
        .map((m) => (m.role === 'user' ? `User: ${m.text}` : `Therapist: ${m.text}`))
        .join('\n');
      const prompt = `You are a compassionate AI therapist. Respond with empathy, warmth, and understanding. Speak naturally, like a real human therapist.\n${history}\nTherapist:`;
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
      setMessages((prev) => [...prev, { role: 'ai', text }]);
      speak(text);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Sorry, I am having trouble responding right now.' }]);
      setCircleState('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSend();
    }
  };

  // Circle animation state
  let circleClass = 'therapist-circle-slime';
  if (circleState === 'listening') circleClass += ' slime-listening';
  if (circleState === 'speaking') circleClass += ' slime-speaking';

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto py-8">
      {/* Animated Slime Circle */}
      <div className="my-8 flex justify-center w-full">
        <div
          className={circleClass}
          aria-label={circleState === 'listening' ? 'Therapist is listening' : circleState === 'speaking' ? 'Therapist is speaking' : 'Therapist is idle'}
        >
          <button
            className="mic-btn"
            onClick={handleMicClick}
            title="Speak to therapist"
            aria-label="Speak to therapist"
            disabled={circleState === 'listening'}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#78350f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>
          </button>
        </div>
      </div>
      {/* Chat History */}
      <div className="w-full bg-white rounded-lg shadow p-4 mb-4 h-96 overflow-y-auto flex flex-col gap-2">
        {messages.length === 0 && (
          <div className="text-gray-400 text-center mt-24">How are you feeling today?</div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-xl px-4 py-2 max-w-[80%] text-base whitespace-pre-line ${
                msg.role === 'user'
                  ? 'bg-yellow-100 text-gray-800 self-end'
                  : 'bg-yellow-300 text-gray-900 self-start'
              }`}
            >
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl px-4 py-2 bg-yellow-300 text-gray-900 animate-pulse">...
            </div>
          </div>
        )}
      </div>
      {/* Input */}
      <div className="w-full flex gap-2">
        <input
          ref={inputRef}
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          type="text"
          placeholder="Type your feelings..."
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={loading || circleState === 'listening'}
          aria-label="Type your message"
        />
        <button
          className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-full px-6 py-2 transition disabled:opacity-50"
          onClick={handleSend}
          disabled={loading || !input.trim() || circleState === 'listening'}
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Therapist; 