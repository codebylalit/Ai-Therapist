import React, { useState } from 'react';

function FAQAccordion({ faqs }) {
  const [openFaq, setOpenFaq] = useState(null);
  return (
    <div className="w-full max-w-2xl mb-16">
      {faqs.map((faq, i) => (
        <div key={i} className="border-b border-gray-200">
          <button
            className="w-full text-left py-4 flex items-center justify-between focus:outline-none"
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
          >
            <span className="font-semibold text-gray-900">{faq.q}</span>
            <span className="ml-2 text-gray-400">{openFaq === i ? '-' : '+'}</span>
          </button>
          {openFaq === i && (
            <div className="pb-4 text-gray-600 text-base pl-2">{faq.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default FAQAccordion; 