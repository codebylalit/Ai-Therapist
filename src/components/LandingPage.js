import React from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import FeatureCard from './FeatureCard';
import FAQAccordion from './FAQAccordion';

const features = [
  {
    title: 'safe & sound',
    desc: 'spill all the tea — calmi\'s got you. your sessions are secure and confidential.',
    img: '',
  },
  {
    title: 'remembers everything',
    desc: 'calmi keeps your whole story in mind. it learns from every conversation, getting to know you better.',
    img: '',
  },
  {
    title: 'therapy profile',
    desc: 'your mental health, mapped out. see insights, recognize patterns, and understand yourself better over time.',
    img: '',
  },
  {
    title: 'session breakdowns',
    desc: 'support doesn\'t end when your chat does. get clear session breakdowns, personalized tips, and homework that sticks.',
    img: '',
  },
  {
    title: 'gen z mode',
    desc: 'because why not? mental health can be fun.',
    img: '',
  },
];

const faqs = [
  {
    q: 'what is calmi?',
    a: 'calmi is your AI-powered companion for exploring your thoughts, emotions, and behaviors in a safe, supportive space.',
  },
  {
    q: 'how does calmi work?',
    a: 'calmi uses advanced AI to chat with you, listen, and offer support. You can talk or type, and calmi adapts to your needs.',
  },
  {
    q: 'is calmi a replacement for traditional therapy?',
    a: 'no, calmi is not a replacement for professional therapy. It\'s a supportive tool for everyday mental wellness.',
  },
  {
    q: 'is my data secure and confidential?',
    a: 'yes! your privacy is a top priority. sessions are confidential and never shared.',
  },
  {
    q: 'does calmi support multiple languages?',
    a: 'currently, calmi works best in English, but more languages are coming soon.',
  },
];

function LandingPage() {
  return (
    <div className="w-full flex flex-col items-center mt-0 px-4">
      {/* Navbar */}
      <nav className="w-full max-w-7xl mx-auto flex items-center justify-between py-6 px-2 md:px-6 mb-2">
        <Link to="/" className="text-2xl font-bold text-gray-900 ">calmi</Link>
        <div className="flex items-center gap-6 text-black font-medium">
          <Link to="/login" className=" text-gray-900 transition-colors">Login</Link>
          <Link to="/signup" className=" text-gray-900 transition-colors border border-yellow-400 rounded px-3 py-1 ml-2 bg-yellow-400">Sign up</Link>
        </div>
      </nav>
      {/* Headline */}
      <div className="max-w-2xl w-full text-left mb-8 mt-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">it's not therapy.<br />it's just calmi.</h1>
        <p className="text-lg text-gray-700 mb-6">your wise, witty ai built to help you explore your thoughts, emotions, and behaviors.</p>
        <Link to="/login">
          <button className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded px-6 py-3 text-lg shadow mb-2">start yapping — it's free</button>
        </Link>
        <div className="text-sm text-gray-400 mt-2">loved by 100,000+ cool people</div>
      </div>
      {/* Centered Card with Animated Circle */}
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg flex flex-col items-center py-12 px-4 mb-12">
        <div className="text-gray-500 mb-2">connecting...</div>
        <div className="calmi-circle mb-2"></div>
        <div className="text-gray-700 mb-6">ok!</div>
        <div className="flex gap-6 mt-2">
          <button className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl text-gray-500 shadow hover:bg-gray-200">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"/></svg>
          </button>
          <button className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-2xl text-white shadow hover:bg-yellow-500">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="6"/></svg>
          </button>
          <button className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl text-gray-500 shadow hover:bg-gray-200">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
      {/* Sponsors Row */}
      <div className="flex flex-wrap justify-center items-center gap-8 mb-16 opacity-70">
        <span className="text-xs font-semibold">IIElevenLabsGrants</span>
        <span className="text-xs font-semibold">Microsoft for Startups Founders Hub</span>
        <span className="text-xs font-semibold">aws startup programs</span>
        <span className="text-xs font-semibold">inQUbate</span>
        <span className="text-xs font-semibold">QualtricsXM</span>
      </div>
      {/* Features Section */}
      <h2 className="text-2xl font-bold text-gray-900 mb-8">all the good stuff</h2>
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl mb-16">
        {features.map((f, i) => (
          <FeatureCard key={i} title={f.title} desc={f.desc} img={f.img} />
        ))}
      </div>
      {/* FAQ Section */}
      <h2 className="text-2xl font-bold text-gray-900 mb-8">frequently asked questions</h2>
      <FAQAccordion faqs={faqs} />
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default LandingPage;
