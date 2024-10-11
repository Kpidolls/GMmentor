import React from 'react';
import Link from 'next/link';

const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Terms and Conditions</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-4 text-gray-600">
          Welcome to Googlementor! These terms and conditions outline the rules and regulations for the use of Googlementor's website and services.
        </p>
        <p className="mb-4 text-gray-600">
          By accessing this website we assume you accept these terms and conditions. Do not continue to use Googlementor if you do not agree to take all of the terms and conditions stated on this page.
        </p>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">License</h2>
        <p className="mb-4 text-gray-600">
          Unless otherwise stated, Googlementor and/or its licensors own the intellectual property rights for all material on Googlementor. All intellectual property rights are reserved. You may access this from Googlementor for your own personal use subjected to restrictions set in these terms and conditions.
        </p>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Users</h2>
        <p className="mb-4 text-gray-600">
        All intellectual
            property rights are reserved. User Account If you create an account
            on our website, you are responsible for maintaining the
            confidentiality of your account and password and for restricting
            access to your computer, and you agree to accept responsibility for
            all activities that occur under your account or password. Prohibited
            Uses You are prohibited from using the site or its content For any
            unlawful purpose To solicit others to perform or participate in any
            unlawful acts To violate any international, federal, provincial, or
            state regulations, rules, laws, or local ordinances To infringe upon
            or violate our intellectual property rights or the intellectual
            property rights of others To harass, abuse, insult, harm, defame,
            slander, disparage, intimidate, or discriminate based on gender,
            sexual orientation, religion, ethnicity, race, age, national origin,
            or disability To submit false or misleading information To upload or
            transmit viruses or any other type of malicious code that will or
            may be used to affect the functionality or operation of the Service
            or of any related website, other websites, or the Internet Affiliate
            Products and Services Googlementor participates in affiliate
            marketing programs. This means we may earn a commission when you
            purchase products or services through our links. We strive to be
            transparent about our affiliate relationships and only promote
            products and services we believe will provide value to our users.
            Limitation of Liability Googlementor will not be liable for any
            damages of any kind arising out of or in connection with the use of
            this site. This is a comprehensive limitation of liability that
            applies to all damages of any kind, including but not limited to
            direct, indirect, incidental, punitive, and consequential damages.
            Indemnification You agree to indemnify, defend, and hold harmless
            Googlementor, its directors, officers, employees, consultants,
            agents, and affiliates, from any and all third-party claims,
            liability, damages, and/or costs (including but not limited to
            attorney fees) arising from your use of our services or your breach
            of these Terms and Conditions. Changes to Terms and Conditions
            Googlementor reserves the right to revise these terms and conditions
            at any time. By using this website, you agree to be bound by the
            current version of these Terms and Conditions. Governing Law These
            terms and conditions are governed by and construed in accordance
            with the laws of England and Wales, and you irrevocably submit to
            the exclusive jurisdiction of the courts in that location.
        </p>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Governing Law</h2>
        <p className="mb-4 text-gray-600">
          These terms and conditions are governed by and construed in accordance with the laws of England and Wales and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
        </p>
        <Link href="/" className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors duration-300">
          Return to Home
        </Link>
        {/* Add more sections as needed */}
      </div>
    </div>
  );
};

export default Terms;