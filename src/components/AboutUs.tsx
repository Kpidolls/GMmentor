import React from 'react';

const AboutUs = () => {
  return (
    <section className="py-12 bg-gray-100" id="aboutus">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900">About Us</h1>
          <p className="mt-4 text-lg text-gray-600">
            Learn more about our mission, values, and the team behind our success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-indigo-600">Our Mission</h2>
            <p className="mt-4 text-gray-600">
            Our mission is to empower individuals and businesses by delivering innovative mapping solutions that enhance connectivity, enrich experiences and drive productivity. We are committed to providing high-quality content that educates, informs, and inspires users worldwide. We aim to create a platform where valuable location-based knowledge is easily accessible to everyone.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-indigo-600">Our Values</h2>
            <p className="mt-4 text-gray-600">
            Our actions and decisions are grounded in our core values of integrity, accessibility, and inclusivity. We are dedicated to delivering accurate, up-to-date information and making complex topics clear and engaging for a diverse audience. Our mission is to cultivate a community of curious minds, united by a shared passion for discovery and learning.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;