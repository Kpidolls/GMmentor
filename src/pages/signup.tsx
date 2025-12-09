import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { metaDescriptions } from '../config/metaDescriptions';

const SignUp: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Head>
        <title>{t('meta.signupTitle')}</title>
        <meta 
          name="description" 
          content={metaDescriptions.signup} 
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://googlementor.com/signup" />
      </Head>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Join Our Team</h1>
        <p className="text-gray-700 text-center mb-6">
          We are always looking for passionate individuals to join our team at Googlementor. If you're interested, please reach out to us at:
        </p>
        <p className="text-center text-blue-600 font-bold mb-6">
          <a href="mailto:mapsmentorinfo@gmail.com">mapsmentorinfo@gmail.com</a>
        </p>
        <p className="text-gray-700 text-center">
          Send us an email with your details, and we'll get back to you as soon as possible!
        </p>
        <Link href="/" className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors duration-300 text-center">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default SignUp;