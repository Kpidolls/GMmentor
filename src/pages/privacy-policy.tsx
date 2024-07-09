import React from 'react';

import Link from 'next/link';

const PrivacyPolicy = () => {
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
            Welcome to Googlementor! At Googlementor, we prioritize your privacy
            and are committed to protecting your personal information. This
            Privacy Policy outlines the types of information we collect, how we
            use and share it, and the measures we take to safeguard your
            information. By using our website and services, you agree to the
            terms of this Privacy Policy. Information Collection and Use: We
            collect information to provide better services to our users. The
            types of information we collect include: Personal Information: When
            you sign up for our newsletter, create an account, or make a
            purchase, we may collect personal details such as your name, email
            address, phone number, and billing information. Non-Personal
            Information: We may collect non-personal information such as browser
            type, operating system, and IP address to enhance your experience on
            our site. Cookies and Tracking Technologies: We use cookies, web
            beacons, and similar technologies to track your activity on our site
            and hold certain information. You can control cookie preferences
            through your browser settings. We use the information we collect for
            various purposes, including: Providing and maintaining our services
            Personalizing your experience Processing transactions and managing
            your orders Sending newsletters, promotional materials, and other
            communications Improving our website, products, and services
            Conducting research and analysis Managing and promoting affiliate
            products and services Disclosure and Sharing We do not sell your
            personal information to third parties. However, we may share your
            information in the following circumstances: Service Providers: We
            may share your information with third-party service providers who
            help us operate our website, conduct our business, or provide
            services to you. Affiliate Partners: We promote affiliate products
            and services and may share non-personal information with our
            affiliate partners to track referrals and sales. Marketing and
            Social Media Services: With your consent, we may share your
            information with marketing and social media platforms to deliver
            targeted advertisements and content. Legal Compliance: We may
            disclose your information to comply with legal obligations, enforce
            our site policies, or protect our rights, property, or safety.
            Cookies and Tracking We use cookies and similar tracking
            technologies to track the activity on our website and store certain
            information. Cookies are files with a small amount of data that are
            sent to your browser from a website and stored on your device.
            Tracking technologies also used are beacons, tags, and scripts to
            collect and track information and to improve and analyze our
            service. You can instruct your browser to refuse all cookies or to
            indicate when a cookie is being sent. However, if you do not accept
            cookies, you may not be able to use some portions of our service.
            Data Security We take the security of your information seriously and
            implement appropriate measures to protect it. This includes using
            secure servers, encryption, and other technical and administrative
            safeguards to prevent unauthorized access, disclosure, or misuse of
            your information. User Rights You have the right to: Access and
            update your personal information Opt-out of receiving promotional
            communications Disable cookies through your browser settings Request
            the deletion of your personal information Compliance We comply with
            applicable data protection laws and regulations, including the
            General Data Protection Regulation (GDPR) for users in the European
            Union. If you are a resident of the EU, you have specific rights
            regarding your personal data, including the right to access,
            correct, delete, or restrict the processing of your data. Changes to
            This Privacy Policy We may update this Privacy Policy from time to
            time to reflect changes in our practices or for other operational,
            legal, or regulatory reasons. We will notify you of any significant
            changes by posting the new policy on our website and updating the
            &quot;Last Updated&quot; date. Contact Us If you have any questions
            or concerns about this Privacy Policy or our practices, please
            contact us at: Googlementor Email: mapsmentorinfo@gmail.com Address:
            [153-157 Cleveland Street, London W1T 6QW] Last Updated:
            [Date15/6/2024]
          </p>
          {/* The rest of your terms and conditions content */}
        </div>
        <p className="text-gray-600">
          By using Googlementor, you agree to the terms of this Privacy Policy.
          Thank you for trusting us with your information!
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
