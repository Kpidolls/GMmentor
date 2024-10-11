import React from 'react';
import Link from 'next/link';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Privacy Policy</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-4 text-gray-600">
          Welcome to Googlementor! At Googlementor, we prioritize your privacy and are committed to protecting your personal information. This Privacy Policy outlines the types of information we collect, how we use and share it, and the measures we take to safeguard your information. By using our website and services, you agree to the terms of this Privacy Policy.
        </p>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Information Collection and Use</h2>
        <p className="mb-4 text-gray-600">
          We collect information to provide better services to our users. The types of information we collect include:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-600">
          <li>Personal Information: When you sign up for our newsletter, create an account, or make a purchase, we may collect personal details such as your name, email address, phone number, and billing information.</li>
          <li>Non-Personal Information: We may collect non-personal information such as browser type, operating system, and IP address to enhance your experience on our site.</li>
        </ul>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Cookies and Tracking Technologies</h2>
        <p className="mb-4 text-gray-600">
          We use cookies, web beacons, and similar technologies to track your activity on our site and hold certain information. You can control cookie preferences through your browser settings.
        </p>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Use of Information</h2>
        <p className="mb-4 text-gray-600">
          We use the information we collect for various purposes, including:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-600">
          <li>Providing and maintaining our services</li>
          <li>Personalizing your experience</li>
          <li>Processing transactions and managing your orders</li>
          <li>Sending newsletters, promotional materials, and other communications</li>
          <li>Improving our website, products, and services</li>
          <li>Conducting research and analysis</li>
          <li>Managing and promoting affiliate products and services</li>
        </ul>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Disclosure and Sharing</h2>
        <p className="mb-4 text-gray-600">
          We do not sell your personal information to third parties. However, we may share your information in the following circumstances:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-600">
          <li>Service Providers: We may share your information with third-party service providers who help us operate our website, conduct our business, or provide services to you.</li>
          <li>Affiliate Partners: We promote affiliate products and services and may share non-personal information with our affiliate partners to track referrals and sales.</li>
          <li>Marketing and Social Media Services: With your consent, we may share your information with marketing and social media services.</li>
        </ul>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Security</h2>
        <p className="mb-4 text-gray-600">
          We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. However, no method of transmission over the internet or method of electronic storage is 100% secure, and we cannot guarantee its absolute security.
        </p>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Changes to This Privacy Policy</h2>
        <p className="mb-4 text-gray-600">
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
        </p>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Contact Us</h2>
        <p className="mb-4 text-gray-600">
          If you have any questions about this Privacy Policy, please contact us at mapsmentorinfo@gmail.com.
        </p>
        <Link href="/" className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors duration-300">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default PrivacyPolicy;