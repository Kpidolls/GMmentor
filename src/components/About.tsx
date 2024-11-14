import React from 'react';
import { FaFacebook, FaTwitter, FaTiktok, FaInstagram } from 'react-icons/fa';
import config from '../config/index.json';
import Link from 'next/link';

const About = () => {
  const { socialMedia } = config.about;

  return (
    <div>
      {/* Other content */}
      <footer className="bg-gray-800 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Links</h3>
              <ul className="text-gray-400">
                <li>
                  <Link href="/login" className="text-gray-200  hover:text-white transition duration-300">
                    Affiliate Partners
                  </Link>
                </li>
                <li>
                    <Link href="/login" className="text-gray-200  hover:text-white transition duration-300">
                    Map Creators
                    </Link>
                  </li>
                  <li>
                    <Link href="#esimproduct" className="text-gray-200  hover:text-white transition duration-300">
                    Mobile Data - eSIM
                    </Link>
                  </li>
                  <li>
                    <Link href="#travelinsurance" className="text-gray-200  hover:text-white transition duration-300">
                    Travel Insurance
                    </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <FaFacebook className="text-2xl text-gray-400 hover:text-white transition duration-300" />
                </a>
                <a href={socialMedia.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <FaTwitter className="text-2xl text-gray-400 hover:text-white transition duration-300" />
                </a>
                <a href={socialMedia.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                  <FaTiktok className="text-2xl text-gray-400 hover:text-white transition duration-300" />
                </a>
                <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <FaInstagram className="text-2xl text-gray-400 hover:text-white transition duration-300" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contact Us</h3>
              <p className="text-gray-400">
                Email: mapsmentorinfo@gmail.com
              </p>
              <p className="text-gray-400 mt-1">
                By contacting us, you accept our{' '}
                <a href="/terms" className="text-gray-200 underline  hover:text-white transition duration-300">
                  terms and conditions
                </a>{' '}
                and{' '}
                <a href="/privacy-policy" className="text-gray-200 underline hover:text-white transition duration-300">
                  privacy policy
                </a>.
              </p>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-4 text-center text-gray-400">
            <p className="text-xs lg:text-sm leading-none text-gray-400">
              Maps data © Google. Google Maps is a trademark of Google LLC.
            </p>
            <p className="mt-4">
              &copy; {new Date().getFullYear()} Copyright{' '}
              <a
                href="https://github.com/IssaafKattan"
                rel="noopener noreferrer"
                className="text-gray-900 dark:text-gray-50"
                target="_blank"
              >
                | Issaaf Kattan
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;