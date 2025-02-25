import React, { useState } from 'react';
import config from '../config/index.json';

/**
 * This component displays product information and allows users to select a map category and request a list via email.
 * It includes a form with a dropdown for selecting map categories and a button to send the request.
 * The country is pre-selected as "Greece" and cannot be changed.
 * 
 * @todo Replace this with mail list functionality and add a checkbox for user agreement.
 */
const Product = () => {
  const { product } = config;
  const [firstItem, secondItem] = product.items || [{}, {}];

  const [selectedOption, setSelectedOption] = useState('');

  const handleCopy = () => {
    const textToCopy = `${selectedOption} - Greece https://googlementor.com`;
    navigator.clipboard.writeText(textToCopy);
  };

  const mapOptions = [
    '📍 Asian Cuisine',
    '📍 Bars & Drinks',
    '📍 Burger Spots',
    '📍 Cheap Eats',
    '📍 Coffee & Brunch',
    '📍 Desserts & Treats',
    '📍 Fish Tavernas',
    '📍 Fish Tavernas with Scenic Views',
    '📍 Gyros & Souvlaki',
    '📍 Hiking Trails',
    '📍 Italian Cuisine',
    '📍 Luxury Dining',
    '📍 Mexican Cuisine',
    '📍 Monasteries & Churches',
    '📍 Must-See Attractions',
    '📍 Rooftop Lounges',
    '📍 Tavernas',
    '📍 Vegan & Vegetarian friendly',
    '📍 Wineries & Vineyards'
  ];

  return (
    <div className="container mx-auto px-4 py-8" id="maps">
      <div className="flex flex-wrap items-center mb-12">
        <div className="w-full md:w-1/2 p-6">
          <h3 className="text-4xl text-gray-800 font-bold leading-tight mb-4">
            {product.title}
          </h3>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed text-justify">
            {firstItem?.description}
            </p>
          {/* <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow hover:bg-blue-700 transition duration-300">
            Learn More
          </button> */}
                <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Request a Free Map List</h2>
        <p className="mb-4">Select the list you want and send us an email with your request.</p>
        <label htmlFor="map-category" className="block mb-2 text-sm font-medium text-gray-700">
          Select a map category
        </label>
        <select
          id="map-category"
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          className="mb-4 p-2 border rounded w-full md:w-auto"
        >
          <option value="" disabled>Select a map category</option>
          {mapOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            handleCopy();
            const encodedOption = encodeURIComponent(selectedOption);
            window.location.href = `mailto:mapsmentorinfo@gmail.com?subject=I agree with googlementor.com terms!&body=I would like the "${encodedOption} in Greece" list`;
          }}
          className={`mt-4 md:mt-0 ml-0 md:ml-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition-colors duration-300 w-full md:w-auto ${!selectedOption ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!selectedOption}
        >
          Request
        </button>
      <button
        type="button"
        onClick={handleCopy}
        className={`mt-4 md:mt-0 ml-0 md:ml-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors duration-300 w-full md:w-auto ${!selectedOption ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={!selectedOption}
      >
        Copy
      </button>
      <div className="mt-6">
        <label htmlFor="country" className="block mb-2 text-sm font-medium text-gray-700">
          Country
        </label>
        <select
          id="country"
          value="Greece"
          disabled
          className="mb-4 p-2 border rounded w-full md:w-auto bg-gray-200 cursor-not-allowed"
        >
          <option value="Greece">Greece</option>
        </select>
      </div>
      </div>
        <div className="mt-6">
            <div className="bg-gray-100 border-l-4 border-gray-300 p-2 rounded-md shadow-md">
              <p className="font-semibold text-gray-800 text-sm">Available Regions</p>
              <p className="text-gray-700 text-sm">We currently offer custom maps for Greece</p>
              {/* comment , with plans to expand to more regions and city-specific lists in the near future. Stay tuned for updates! */}
            </div>
        </div>
        </div>
        <div className="w-full md:w-1/2 p-6">
          <img
            className="w-full h-auto rounded-lg shadow-md"
            src={firstItem?.img}
            alt={firstItem?.title}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center">
        <div className="w-full md:w-1/2 p-6 order-2 md:order-1">
          <img
            className="w-full h-auto rounded-lg shadow-md"
            src={secondItem?.img}
            alt={secondItem?.title}
          />
        </div>
        <div className="w-full md:w-1/2 p-6 order-1 md:order-2">
          <h3 className="text-4xl text-gray-800 font-bold leading-tight mb-4">
            {secondItem?.title}
          </h3>
          <p className="text-gray-600 text-lg mb-6">{secondItem?.description}</p>
          {/* <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow hover:bg-blue-700 transition duration-300">
            Learn More
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default Product;
