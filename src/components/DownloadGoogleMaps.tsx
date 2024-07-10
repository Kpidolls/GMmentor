import React from 'react';

const DownloadGoogleMaps = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-xl" id="download">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Download Google Maps
        </h2>
        <div className="flex flex-wrap justify-center gap-10">
          <a
            href="https://apps.apple.com/app/google-maps/id585027354"
            className="text-center"
          >
            <img
              src="\assets\images\App-Store-Logo.jpg"
              alt="Download on iPhone"
              className="mb-4 h-16 w-16 mx-auto"
            />
            <h3 className="text-xl font-semibold">iPhone</h3>
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.google.android.apps.maps"
            className="text-center"
          >
            <img
              src="\assets\images\google-play-store.jpg"
              alt="Download on Android"
              className="mb-4 h-16 w-16 mx-auto"
            />
            <h3 className="text-xl font-semibold">Android</h3>
          </a>
          {/* Additional links for other platforms if necessary */}
        </div>
      </div>
    </div>
  );
};

export default DownloadGoogleMaps;
