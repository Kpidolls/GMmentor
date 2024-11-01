import React, { useEffect } from 'react';

const TravelInsurance = () => {
  useEffect(() => {
    // Check if the script is already present
    if (!document.querySelector('script[src="https://storage.googleapis.com/safetywing-static/widget/safetywing-price-widget.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://storage.googleapis.com/safetywing-static/widget/safetywing-price-widget.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Travel Insurance
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Protect yourself while traveling with comprehensive travel insurance from SafetyWing.
        </p>
        <div className="flex justify-center mb-8">
          <a
            href="https://safetywing.com/?referenceID=26193325&utm_source=26193325&utm_medium=Ambassador"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white font-bold rounded-full py-4 px-8 shadow-lg hover:bg-blue-700 transition duration-300"
          >
            Get Travel Insurance
          </a>
        </div>
        <div className="flex justify-center mb-8">
          <div
            className="safetywing-price-widget" // spell-checker: disable-line
            data-safetywing-affiliate-id="26193325" // spell-checker: disable-line
            data-scale="1.0"
          ></div>
        </div>
        <div className="flex justify-center">
          <iframe
            src="https://safetywing.com/?referenceID=26193325&utm_source=26193325&utm_medium=Ambassador"
            width="100%"
            height="600"
            title="SafetyWing Travel Insurance"
            className="rounded-lg shadow-md"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default TravelInsurance;