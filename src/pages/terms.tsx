import React from 'react';

import Link from 'next/link';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="flex justify-between items-center py-4">
        <h1 className="text-xl font-semibold">Google Mentor</h1>
        <Link href="/">
          <a className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors duration-300">
            Home
          </a>
        </Link>
      </nav>
      <div className="mt-8">
        <h2 className="text-3xl font-bold mb-4">Terms and Conditions</h2>
        <div className="mb-6 p-4 bg-gray-100 rounded-lg shadow">
          <p className="mb-4 text-gray-600">
            Welcome to Googlementor! These terms and conditions outline the
            rules and regulations for the use of Googlementor&apos;s website and
            services. Terminology The following terminology applies to these
            Terms and Conditions, Privacy Policy, and all Agreements Client,
            You, and Your refer to you, the person using this website and
            compliant with the Company&apos;s terms and conditions. The Company,
            Ourselves, We, Our, and Us, refer to our Company. Party, Parties, or
            Us, refers to both the Client and ourselves. Use of the Website By
            using our website, you agree to comply with and be bound by the
            following terms and conditions of use Content The content of the
            pages of this website is for your general information and use only.
            It is subject to change without notice. License Unless otherwise
            stated, Googlementor andor its licensors own the intellectual
            property rights for all material on Googlementor. All intellectual
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
            with the laws of [England and Wales], and you irrevocably submit to
            the exclusive jurisdiction of the courts in that location. Contact
            Us If you have any questions or concerns about these Terms and
            Conditions, please contact us at Googlementor Email:
            mapsmentorinfo@gmail.com Address [153-157 Cleveland Street, London
            W1T 6QW] Last Updated: [Date15/6/2024]
          </p>
          {/* The rest of your terms and conditions content */}
        </div>
        <p className="text-gray-600">
          By using MapsMentor, you agree to the terms of these Terms and
          Conditions. Thank you for using our services!
        </p>
      </div>
    </div>
  );
};

export default Terms;
