import React from 'react';

const TravelInsurance = () => {
  return (
    <section className="bg-white py-16" id="travelinsurance">
      <div className="container mx-auto px-6 lg:px-8">
        <h2 className="text-5xl font-extrabold text-center text-gray-900 mb-12">
          Travel Insurance
        </h2>
        <p className="text-center text-lg text-gray-700 mb-12">
          Protect yourself while traveling with comprehensive travel insurance from SafetyWing.
        </p>
        <div className="flex justify-center mb-12">
          <img
            src="/assets/images/NI-info-2.png"
            alt="Travel Insurance Infographic"
            className="w-full max-w-lg rounded-lg shadow-xl"
          />
        </div>
        <div className="flex justify-center mb-12">
          <a
            href="https://safetywing.com/?referenceID=26193325&utm_source=26193325&utm_medium=Ambassador"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white font-bold rounded-full py-4 px-10 shadow-lg hover:bg-blue-700 transition duration-300"
          >
            Get Travel Insurance
          </a>
        </div>
        <div className="text-center text-gray-700">
          <p className="mb-6 text-lg">
            Traveling can be unpredictable. Ensure you are covered with SafetyWing's comprehensive travel insurance. Click the button above to get started and protect yourself on your next adventure.
          </p>
          <p className="text-lg">
            Our travel insurance offers coverage for medical expenses, trip cancellations, lost luggage, and more. Don't leave home without it!
          </p>
        </div>
      </div>
    </section>
  );
};

export default TravelInsurance;