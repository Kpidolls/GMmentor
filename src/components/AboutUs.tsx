import React from 'react';

const AboutUs = () => {
  return (
    <div className="container mx-auto px-40 py-8" id="about">
      <h1 className="text-3xl font-bold text-center mb-4">About Us</h1>
      <div className="space-y-4">
        <section>
          <h2 className="text-2xl font-semibold">Our Mission</h2>
          <p className="text-gray-600">
            Our mission is to empower individuals and businesses by providing
            solutions that enhance connectivity and productivity. We are
            dedicated to providing essential content that both educates and
            entertains millions around the globe.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold">Our Values</h2>
          <p className="text-gray-600">
            Integrity, accessibility, and Inclusivity are the core values that
            guide our actions and decisions. We strive to ensure our information
            is reliable and up-to-date, making complex topics understandable and
            enjoyable for diverse audiences. We believe in fostering a community
            of curious learners and leveraging the power of technology to
            connect and inspire people worldwide. We are committed to building
            trust with our customers, employees, and partners.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold">Our Vision</h2>
          <p className="text-gray-600">
            We envision a world where knowledge is universally accessible and
            learning is a dynamic, interactive experience. By harnessing the
            capabilities of Google Maps and other innovative tools, we aim to
            become a leading source of educational content that transforms the
            way people explore and understand the world around them.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
