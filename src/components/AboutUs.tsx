import React from 'react';

const AboutUs = () => {
  return (
    <section className="py-12 bg-gray-100" id="aboutus">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900">About Us</h1>
          <p className="mt-4 text-lg text-gray-600">
            Learn more about our mission, values and the team behind our success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-indigo-600">Our Mission</h2>
            <p className="mt-4 text-gray-600">
              Our mission is to empower individuals and businesses with smart navigation and mapping tools that foster connectivity, enrich experiences, and boost productivity. We are dedicated to providing high-quality content that educates, informs, and inspires users globally. Our vision is to create a platform where location-based knowledge is accessible to everyone, enabling discovery and learning. Together, we aim to build a community driven by curiosity and a shared passion for exploration.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-indigo-600">Our Values</h2>
            <p className="mt-4 text-gray-600">
            We prioritize integrity, ensuring that honesty and transparency guide our actions and decisions. We strive to provide clear, accurate information that is easily understandable for everyone, regardless of their background. We embrace inclusivity, fostering an environment where diverse perspectives are valued and encouraged. We emphasize authenticity in our interactions, building trust through genuine connections that value locals insights. 
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;