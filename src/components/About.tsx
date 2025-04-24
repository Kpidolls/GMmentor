import React from 'react';
import config from '../config/index.json';
import Link from 'next/link';

const SocialMediaIcon = ({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition duration-300 shadow-md hover:shadow-lg"
  >
    <div className="h-8 w-h-10 w-10 flex items-center justify-center text-white">
      {children}
    </div>
  </a>
);

const About = () => {
  const { socialMedia } = config.about;

  return (
    <div>
      {/* Other content */}
      <footer id="footer" className="bg-gray-800 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Links Section */}
            <div>
              <h3 className="text-lg font-bold font-primary mb-4">Links</h3>
              <ul className="text-gray-400 space-y-2">
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

            {/* Follow Us Section */}
            <div className="md:col-span-2 lg:col-span-2 xl:col-span-1">
              <h3 className="text-lg font-bold font-primary mb-4 text-left md:text-left ">Follow Us</h3>
              <div className="flex flex-wrap justify-start md:justify-start gap-4">
                {/* Facebook Icon */}
                <SocialMediaIcon href={socialMedia.facebook} label="Follow us on Facebook">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.325v21.351C0 23.4.6 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.463.099 2.794.143v3.24h-1.918c-1.504 0-1.796.715-1.796 1.763v2.31h3.587l-.467 3.622h-3.12V24h6.116c.725 0 1.325-.6 1.325-1.324V1.325C24 .6 23.4 0 22.675 0z" />
                  </svg>
                </SocialMediaIcon>

                {/* Twitter Icon */}
                <SocialMediaIcon href={socialMedia.twitter} label="Follow us on Twitter">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557a9.83 9.83 0 01-2.828.775 4.932 4.932 0 002.165-2.724 9.864 9.864 0 01-3.127 1.195 4.916 4.916 0 00-8.384 4.482A13.944 13.944 0 011.671 3.149a4.916 4.916 0 001.523 6.573 4.897 4.897 0 01-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.935 4.935 0 01-2.224.084 4.918 4.918 0 004.6 3.417A9.867 9.867 0 010 21.543a13.94 13.94 0 007.548 2.212c9.142 0 14.307-7.721 13.995-14.646A9.936 9.936 0 0024 4.557z" />
                  </svg>
                </SocialMediaIcon>

                {/* TikTok Icon */}
                <SocialMediaIcon href={socialMedia.tiktok} label="Follow us on TikTok">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.991 4.388 10.937 10.125 11.854v-8.385H7.078v-3.47h3.047V9.413c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.953.926-1.953 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 22.937 24 17.991 24 12 24 5.373 18.627 0 12 0z" />
                  </svg>
                </SocialMediaIcon>

                {/* Instagram Icon */}
                <SocialMediaIcon href={socialMedia.instagram} label="Follow us on Instagram">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.332 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.332-3.608-1.308-.975-.975-1.246-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.246 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163C8.756 0 8.332.014 7.052.072 5.773.13 4.548.396 3.465 1.48 2.382 2.564 2.116 3.789 2.058 5.068.014 8.332 0 8.756 0 12s.014 3.668.072 4.948c.058 1.279.324 2.504 1.408 3.588 1.084 1.084 2.309 1.35 3.588 1.408 1.28.058 1.704.072 4.948.072s3.668-.014 4.948-.072c1.279-.058 2.504-.324 3.588-1.408 1.084-1.084 1.35-2.309 1.408-3.588.058-1.28.072-1.704.072-4.948s-.014-3.668-.072-4.948c-.058-1.279-.324-2.504-1.408-3.588-1.084-1.084-2.309-1.35-3.588-1.408C15.668.014 15.244 0 12 0z" />
                    <path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zM18.406 4.594a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" />
                  </svg>
                </SocialMediaIcon>
              </div>
            </div>

            {/* Support Us Section */}
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

            {/* Contact Us Section */}
            <div>
              <h3 className="text-lg font-bold font-primary mb-4">Contact Us</h3>
              <p className="text-gray-400 font-secondary">
                Email: mapsmentorinfo@gmail.com
              </p>
              <p className="text-gray-400 font-secondary mt-1">
                By contacting us, you accept our{' '}
                <Link
                  href="/terms"
                  className="text-gray-200 underline hover:text-white transition duration-300"
                  aria-label="Read our terms and conditions"
                >
                  terms and conditions
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy-policy"
                  className="text-gray-200 underline hover:text-white transition duration-300"
                  aria-label="Read our privacy policy"
                >
                  privacy policy
                </Link>.
              </p>
            </div>
          </div>

          {/* Footer Bottom Section */}
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