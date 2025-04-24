import React from 'react';
import config from '../config/index.json';
import Link from 'next/link';
import { FaFacebook as RawFaFacebook, FaTwitter as RawFaTwitter, FaTiktok as RawFaTiktok, FaInstagram as RawFaInstagram } from 'react-icons/fa';

const FaFacebook = RawFaFacebook as React.ComponentType<{ className?: string }>;
const FaTwitter = RawFaTwitter as React.ComponentType<{ className?: string }>;
const FaTiktok = RawFaTiktok as React.ComponentType<{ className?: string }>;
const FaInstagram = RawFaInstagram as React.ComponentType<{ className?: string }>;


const About = () => {
  const { socialMedia } = config.about || {};

  return (
    <div>
      <footer id="footer" className="bg-gray-800 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold font-primary mb-4">Links</h3>
              <ul className="text-gray-400">
                <li>
                  <Link href="/login" className="text-gray-200 font-secondary hover:text-white transition duration-300">
                    Affiliate Partners
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-gray-200 font-secondary hover:text-white transition duration-300">
                    Map Creators
                  </Link>
                </li>
                <li>
                  <Link href="#store" className="text-gray-200 font-secondary hover:text-white transition duration-300">
                    Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="#travelinsurance"
                    className="text-gray-200 font-secondary hover:text-white transition duration-300"
                  >
                    Travel Insurance
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold font-primary mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a
                  href={socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Facebook"
                >
                  <FaFacebook className="text-2xl text-gray-400 hover:text-white transition duration-300" /> 
                </a>
                <a
                  href={socialMedia.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Twitter"
                >
                  <FaTwitter className="text-2xl text-gray-400 hover:text-white transition duration-300" />
                </a>
                <a
                  href={socialMedia.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on TikTok"
                >
                  <FaTiktok className="text-2xl text-gray-400 hover:text-white transition duration-300" />
                </a>
                <a
                  href={socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                >
                  <FaInstagram className="text-2xl text-gray-400 hover:text-white transition duration-300" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold font-primary mb-4">Support Us</h3>
              <p className="text-gray-400 font-secondary">
                If you find our content helpful, consider supporting us.
              </p>
              <a
                href="https://buymeacoffee.com/googlementor"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 px-6 py-2 font-secondary bg-yellow-500 text-gray-900 font-semibold rounded hover:bg-yellow-600 transition duration-300"
                aria-label="Support us by buying a coffee"
              >
                Buy Me a Coffee
              </a>
            </div>
            <div>
              <h3 className="text-lg font-bold font-primary mb-4">Contact Us</h3>
              <p className="text-gray-400 font-secondary">
                Email: mapsmentorinfo@gmail.com
              </p>
              <p className="text-gray-400 font-secondary mt-1">
                By contacting us, you accept our{' '}
                <a
                  href="/terms"
                  className="text-gray-200 underline hover:text-white transition duration-300"
                  aria-label="Read our terms and conditions"
                >
                  terms and conditions
                </a>{' '}
                and{' '}
                <a
                  href="/privacy-policy"
                  className="text-gray-200 underline hover:text-white transition duration-300"
                  aria-label="Read our privacy policy"
                >
                  privacy policy
                </a>.
              </p>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-4 text-center text-gray-400">
            <p className="text-xs font-secondary lg:text-sm leading-none text-gray-400">
              Maps data © Google. Google Maps is a trademark of Google LLC.
            </p>
            <p className="mt-4 font-secondary">
              &copy; {new Date().getFullYear()} Copyright{' '}
              <a
                href="https://github.com/issaafalkattan/React-Landing-Page-Template"
                rel="noopener noreferrer"
                className="text-gray-900 dark:text-gray-50"
                target="_blank"
                aria-label="Visit the GitHub repository for the React Landing Page Template"
              >
                | I. Kattan
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;