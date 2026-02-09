import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { metaDescriptions } from '../config/metaDescriptions';

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  return (
    <div>
      <Head>
        <title>{t('meta.privacyTitle', 'Privacy Policy - Googlementor')}</title>
        <meta name="description" content={metaDescriptions.privacyPolicy} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://googlementor.com/privacy-policy" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Privacy Policy</h1>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="mb-4 text-gray-600">
              Googlementor is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mapping services and shop for custom maps. By using Googlementor, you agree to the collection and use of information in accordance with this policy.
            </p>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Information We Collect</h2>
            <p className="mb-4 text-gray-600">
              <strong>Personal Information:</strong> When registering for an account or purchasing items, we may ask for personal details such as your name, email address, phone number, and shipping/billing addresses.
            </p>
            <p className="mb-4 text-gray-600">
              <strong>Usage Data:</strong> We collect information about how you use our services, including navigation history, map views, purchase records, and browsing behavior.
            </p>
            <p className="mb-4 text-gray-600">
              <strong>Payment Information:</strong> We store payment information securely for transactions made through our platform.
            </p>
            <p className="mb-4 text-gray-600">
              <strong>Geolocation Data:</strong> With your consent, we may access your device&apos;s geolocation to provide location-specific suggestions and directions.
            </p>
            <p className="mb-4 text-gray-600">
              <strong>Cookies and Tracking Technologies:</strong>
            </p>
            <ul className="list-disc list-inside mb-4 text-gray-600">
              <li><strong>Cookies:</strong> Used to personalize your experience and analyze trends.</li>
              <li><strong>Pixels:</strong> Employed for re-targeting advertisements based on your past visits.</li>
            </ul>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">How We Use Your Information</h2>
            <p className="mb-4 text-gray-600">
              Googlementor uses the collected data for various purposes:
            </p>
            <ul className="list-disc list-inside mb-4 text-gray-600">
              <li>To provide and maintain our mapping services.</li>
              <li>To fulfill orders and ship purchased items.</li>
              <li>To communicate with you about order status, promotions, and product releases.</li>
              <li>To personalize your shopping experience based on your preferences.</li>
              <li>To monitor the effectiveness of our marketing campaigns.</li>
            </ul>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Sharing Your Information</h2>
            <p className="mb-4 text-gray-600">
              We may share your information in the following situations:
            </p>
            <ul className="list-disc list-inside mb-4 text-gray-600">
              <li><strong>Affiliate Products:</strong> When recommending affiliated products or services, we might share basic contact details like email addresses.</li>
              <li><strong>Service Providers:</strong> We employ third-party companies to facilitate our services (&quot;Service Providers&quot;), provide payment processing solutions, perform service-related tasks, or assist us in analyzing usage trends.</li>
            </ul>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Rights</h2>
            <p className="mb-4 text-gray-600">
              Depending on your location, you may have rights regarding personal data:
            </p>
            <ul className="list-disc list-inside mb-4 text-gray-600">
              <li><strong>Right to Access:</strong> Request copies of your personal data.</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete information.</li>
              <li><strong>Right to Erasure:</strong> Delete your account under certain conditions.</li>
              <li><strong>Right to Restrict Processing:</strong> Limit further processing under specified circumstances.</li>
              <li><strong>Right to Data Portability:</strong> Transfer collected data between organizations or directly back to yourself under applicable laws.</li>
            </ul>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Changes to Privacy Policy</h2>
            <p className="mb-4 text-gray-600">
              We reserve the right to update this privacy policy periodically. Any changes will be posted here. You agree to review these updates regularly since continued access signifies acceptance of revised policies.
            </p>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Contact Us</h2>
            <p className="mb-4 text-gray-600">
              If you have any questions about this Privacy Policy, please contact us via email at mapsmentorinfo@gmail.com.
            </p>
            <Link href="/" className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors duration-300">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;