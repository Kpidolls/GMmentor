import React from 'react';
import { BookmarkIcon } from '@heroicons/react/solid';

const CreateList = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center mb-8">How to Create a List on Google Maps</h2>
      <div className="space-y-8">
        {/* Step 1 */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center mb-4">
            <h3 className="font-bold text-xl text-blue-600">Step 1:</h3>
            <h3 className="font-bold text-red-600 text-xl ml-2 flex items-center">Tap “You” 
              <BookmarkIcon className="h-6 w-6 text-blue-600 ml-2" />
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            You can manage your lists under the “Saved” tab on Google Maps app to get started.
            When creating lists in Google Maps, it's important to note that the steps may vary slightly
            depending on the device you are using.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center mb-4">
            <h3 className="font-bold text-xl text-blue-600">Step 2:</h3>
            <h3 className="font-bold text-red-600 text-xl ml-2">Select “+ New List”</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Navigate to the “+ New List” section to create a new list.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center mb-4">
            <h3 className="font-bold text-xl text-blue-600">Step 3:</h3>
            <h3 className="font-bold text-red-600 text-xl ml-2">Choose a Name</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Add the name of the list. You can also add a description and emoji if you create the list on a mobile device.
          </p>
        </div>

        {/* Step 4 */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center mb-4">
            <h3 className="font-bold text-xl text-blue-600">Step 4:</h3>
            <h3 className="font-bold text-red-600 text-xl ml-2">Add Location to Your List</h3>
          </div>
          <p className="text-gray-600 mb-4">
          Enhance your lists by adding locations and personalized notes to make them even more valuable. Share your curated lists effortlessly via link or directly through the Google Maps app. For assistance or to discuss selling your list as an e-map guide, feel free to reach out to us.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateList;