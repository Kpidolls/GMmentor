import React, { useState } from 'react';
import config from '../config/index.json';

const Product = () => {
  const { product } = config;
  const [firstItem, secondItem] = product.items;

  const [selectedOption, setSelectedOption] = useState('');

  const handleCopy = () => {
    const textToCopy = `${selectedOption} - Greece`;
    navigator.clipboard.writeText(textToCopy);
  };

  const mapOptions = [
    'Asian food',
    'Bougatsa',
    'Brunch - Coffee - Bakeries',
    'Burgers',
    'Cheap Eats - Street food',
    'Desserts',
    'Drinks',
    'Fish Tavern',
    'Fish Tavern with view',
    'Greek restaurants',
    'Gyros - Souvlaki - Kebabs',
    'Hiking Trails',
    'Italian food',
    'Luxury Dining',
    'Mexican food',
    'Monasteries - Churches',
    'Monuments - Tourist Attractions',
    'Rooftops',
    'Vegan - Vegetarian friendly',
    'Winery - Vineyards'
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
          className="mb-4 p-2 border rounded"
        >
          <option value="" disabled>Select a map category</option>
          {mapOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            handleCopy();
            window.location.href = `mailto:mapsmentorinfo@gmail.com?subject=I agree with googlementor.com terms!&body=I would like the "${selectedOption} in Greece" list`;
          }}
          className="ml-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition-colors duration-300"
        >
          Request
        </button>
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
