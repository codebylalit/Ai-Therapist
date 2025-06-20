import React from 'react';

function FeatureCard({ title, desc, img }) {
  return (
    <div className="bg-gray-50 rounded-xl shadow p-6 flex flex-col md:flex-row items-center gap-6">
      <div className="flex-1 text-left">
        <div className="font-bold text-lg mb-2 text-gray-900">{title}</div>
        <div className="text-gray-600 text-base">{desc}</div>
      </div>
      <div className="w-40 h-28 bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-xl flex items-center justify-center">
        {/* Placeholder for feature image or screenshot */}
        {img && <img src={img} alt="feature" className="max-h-24 max-w-full rounded" />}
      </div>
    </div>
  );
}

export default FeatureCard; 