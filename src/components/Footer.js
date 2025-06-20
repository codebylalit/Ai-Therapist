import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="w-full border-t border-gray-100 pt-12 pb-8 flex flex-col items-center">
      <h3 className="text-xl font-bold mb-2">get started for free</h3>
      <div className="text-gray-500 mb-4">be heard. be understood. be better.</div>
      <Link to="/home">
        <button className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded px-6 py-3 text-lg shadow mb-8">try calmi free</button>
      </Link>
      <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400 mb-2">
        <span className="font-bold text-gray-900">calmi</span>
        <span>socials instagram tiktok x (twitter) linkedin</span>
        <span>legal privacy policy terms of service ai disclaimer</span>
      </div>
      <div className="text-xs text-gray-300">© 2025 calmi.so</div>
    </footer>
  );
}

export default Footer; 