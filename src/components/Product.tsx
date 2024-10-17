import React from 'react';

import config from '../config/index.json';

const Product = () => {
  const { product } = config;
  const [firstItem, secondItem] = product.items;

  return (
    <div className="container mx-auto px-4 py-8" id="maps">
      <div className="flex flex-wrap items-center mb-12">
        <div className="w-full md:w-1/2 p-6">
          <h3 className="text-4xl text-gray-800 font-bold leading-tight mb-4">
            {product.title}
          </h3>
          <p className="text-gray-600 text-lg mb-6">{firstItem?.description}</p>
          {/* <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow hover:bg-blue-700 transition duration-300">
            Learn More
          </button> */}
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
