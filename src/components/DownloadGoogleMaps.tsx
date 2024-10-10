import React from 'react';

const DownloadGoogleMaps = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-lg shadow-xl" id="download">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Start Creating Lists: Download Google Maps First
        </h2>
        <p className="text-lg text-gray-600 text-center mb-8">
          To get started with creating and managing lists, download the Google Maps app on your device.
        </p>
        <div className="flex flex-wrap justify-center gap-10">
          <a
            href="https://apps.apple.com/app/google-maps/id585027354"
            className="text-center"
              target="_blank"
              rel="noopener noreferrer"
          >
            <img
              src="/assets/images/App-Store-Logo.jpg"
              alt="Download on iPhone"
              className="h-16"
            />
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.google.android.apps.maps"
            className="text-center"
            target="_blank"
            rel="noopener noreferrer"            
          >
            <img
              src="/assets/images/google-play-store.jpg"
              alt="Download on Android"
              className="h-16"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default DownloadGoogleMaps;