import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../App';

const FeatureCard = ({ title, desc, icon }) => {
  const { theme } = useTheme();

  return (
    <div className={`rounded-2xl shadow-lg p-8 flex flex-col items-start gap-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 h-full ${
      theme === 'dark' ? 'bg-[#1E293B]' : 'bg-white'
    }`}>
      {icon && (
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-110 ${
          theme === 'dark' ? 'bg-slate-700' : 'bg-yellow-100'
        }`}>
          {icon}
        </div>
      )}
      <div className="text-left">
        <div className={`font-bold text-xl mb-1 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>{title}</div>
        <p className={`text-base leading-relaxed ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>{desc}</p>
      </div>
    </div>
  );
};

FeatureCard.propTypes = {
  title: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
  icon: PropTypes.node
};

export default FeatureCard; 