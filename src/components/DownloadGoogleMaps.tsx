import React from 'react';

const DownloadGoogleMaps = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 px-4 md:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="bg-white p-10 rounded-lg shadow-xl" id="download">
        <h2 className="flex justify-center text-3xl font-bold mb-6 text-gray-800">
          Download Google Maps
        </h2>{' '}
        {/* More subdued text color */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <img
              src="\assets\images\App-Store-Logo.jpg"
              alt="Download on iPhone"
              className="mb-4 md:mb-0 md:mr-4 h-16 w-16"
            />
            <div className="text-left">
              <h3 className="text-xl font-semibold">iPhone</h3>
              <p>
                Get the app from the{' '}
                <a
                  href="https://apps.apple.com/app/google-maps-transit-food/id585027354"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  App Store
                </a>
                .
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <img
              src="\assets\images\google-play-store.jpg"
              alt="Download on Android"
              className="mb-4 md:mb-0 md:mr-4 h-16 w-16"
            />
            <div>
              <h3 className="text-xl font-semibold">Android</h3>
              <p>
                Download from the{' '}
                <a
                  href="https://play.google.com/store/apps/details?id=com.google.android.apps.maps&hl=en&gl=US"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Google Play Store
                </a>
                .
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <img
              src="\assets\images\pc.png"
              alt="Download on PC"
              className="mb-4 md:mb-0 md:mr-4 h-16 w-16"
            />
            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-xl font-semibold mb-4 md:mb-0">PC</h3>
              <p>
                Access Google Maps online at{' '}
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  maps.google.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadGoogleMaps;
