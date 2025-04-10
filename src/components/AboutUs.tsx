import React from 'react';

const AboutUs = () => {
  return (
    <section className="py-16 bg-gray-100" id="aboutus">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900">About Us</h1>
          <p className="mt-4 text-lg text-gray-600">
            Discover the story behind our platform and the principles that guide us.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            This platform was built with friends, for friends. It came to life from real conversations, shared adventures and the joy of discovering hidden gems. Our mission is to make smart, honest recommendations easy to find and share.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed">
            We value simplicity, integrity and authenticity. Whether you're exploring a new city or your own neighborhood, we aim to make location-based knowledge accessible, useful and personal. This platform grows every day with the help of people like you—curious, open and eager to contribute. Together, we’re building something meaningful, one recommendation at a time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;