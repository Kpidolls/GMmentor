import React from 'react';
import Link from 'next/link';
import secondaryAction from '../config/index.json';


const dummyLogin: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
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
              type="password"
              placeholder="Enter your password"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
            >
              Login
            </button>
            <Link href="/" className="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800">
                Forgot Password?
            </Link>
          </div>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Don't have an account?{' '}
          <Link href={secondaryAction.mainHero.secondaryAction.href} className="text-blue-600 hover:text-blue-800">Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default dummyLogin;