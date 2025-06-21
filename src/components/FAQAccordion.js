import React, { useState } from 'react';
import { useTheme } from '../App';

function FAQAccordion({ faqs }) {
  const [openFaq, setOpenFaq] = useState(null);
  const { theme } = useTheme();
  
  return (
    <div className="w-full max-w-2xl mb-16">
      {faqs.map((faq, i) => (
        <div key={i} className={`border-b transition-colors duration-300 ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            className="w-full text-left py-4 flex items-center justify-between focus:outline-none"
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
          >
            <span className={`font-semibold transition-colors duration-300 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{faq.q}</span>
            <span className={`ml-2 transition-colors duration-300 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
            }`}>{openFaq === i ? '-' : '+'}</span>
          </button>
          {openFaq === i && (
            <div className={`pb-4 text-base pl-2 transition-colors duration-300 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>{faq.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default FAQAccordion; 