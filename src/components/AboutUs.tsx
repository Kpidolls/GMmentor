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
              Our mission is to empower individuals and businesses by providing solutions that enhance connectivity and productivity. We are dedicated to providing essential content that both educates and entertains millions around the globe.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-indigo-600">Our Values</h2>
            <p className="mt-4 text-gray-600">
              Integrity, accessibility, and inclusivity are the core values that guide our actions and decisions. We strive to ensure our information is reliable and up-to-date, making complex topics understandable and enjoyable for diverse audiences. We believe in fostering a community of curious minds.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;