import React from 'react';

const TravelInsurance = () => {
  return (
    <section className="bg-background py-16" id="travelinsurance">
      <div className="container mx-auto px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold text-center text-gray-900 font-primary mb-6">
          Travel Insurance
        </h2>
        <p className="text-center text-lg text-gray-600 font-secondary mb-6">
          Protect yourself while traveling with comprehensive travel insurance from SafetyWing.
        </p>
        <div className="flex justify-center mb-8">
          <img
        src="/assets/images/NI-info-2.png"
        alt="Travel Insurance Infographic"
        className="w-full max-w-lg rounded-lg shadow-lg"
          />
        </div>
        <div className="flex justify-center mb-6">
          <a
        href="https://safetywing.com/?referenceID=26193325&utm_source=26193325&utm_medium=Ambassador"
        target="_self"
        rel="noopener noreferrer"
        className="px-8 py-3 bg-primary font-secondary text-white font-semibold rounded-lg shadow-lg hover:bg-secondary transition duration-300"
          >
        Get Travel Insurance
          </a>
        </div>
        <div className="text-center text-gray-600">
          <p className="mb-4 text-base font-secondary sm:text-lg leading-relaxed">
        Traveling can be unpredictable. Ensure you are covered with SafetyWing's comprehensive travel insurance. 
          </p>
          <p className="text-base font-secondary sm:text-lg leading-relaxed">
        Our travel insurance offers coverage for medical expenses, trip cancellations, lost luggage, and more. Don't leave home without it!
          </p>
        </div>
      </div>
    </section>
  );
};

export default TravelInsurance;