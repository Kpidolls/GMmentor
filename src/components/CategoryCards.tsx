import React from 'react';
import {
  AccountBalance as MustSeeIcon,
  BeachAccess as IslandsIcon,
  Landscape as HikingIcon,
  Restaurant as FoodIcon,
} from '@mui/icons-material';

const categories = [
  { name: 'Must See', icon: <MustSeeIcon className="text-blue-600 text-6xl" />, tag: 'must', link: '#maps' },
  { name: 'Islands', icon: <IslandsIcon className="text-blue-600 text-6xl" />, tag: 'islands', link: '#islands' },
  { name: 'Food', icon: <FoodIcon className="text-blue-600 text-6xl" />, tag: 'food', link: '#vegan' },
  { name: 'Hiking', icon: <HikingIcon className="text-blue-600 text-6xl" />, tag: 'hiking', link: '#hiking' },
];

export default function CategoryCards() {
  return (
    <section id="categories" className="py-16 bg-gray-100 mt-16 lg:mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-center font-primary text-3xl font-extrabold text-gray-900 mb-8">
          Explore Lists by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <a
              key={cat.tag}
              href={cat.link}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl font-secondary text-center transition duration-300 transform hover:scale-105"
              aria-label={`Explore ${cat.name} category`}
            >
              <div className="mb-4">{cat.icon}</div>
              <div className="text-lg font-semibold text-gray-800">{cat.name}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}