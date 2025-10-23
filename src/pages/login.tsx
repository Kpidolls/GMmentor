import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';

const Login: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Head>
        <title>{t('meta.loginTitle')}</title>
        <meta 
          name="description" 
          content={t('meta.loginDescription')} 
        />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://googlementor.com/login" />
      </Head>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Login</h1>
        <form>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={() => alert('Invalid email or password')}
            >
              Login
            </button>
            <Link href="/" className="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800" 
              onClick={() => alert('Invalid email')}>
                Forgot Password?
            </Link>
          </div>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:text-blue-800">
            Sign Up
          </Link>
        </p>
        <Link href="/" className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors duration-300">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default Login;