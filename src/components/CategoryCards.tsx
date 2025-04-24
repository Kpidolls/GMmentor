import React from 'react';
import { GiIsland, GiForkKnifeSpoon } from 'react-icons/gi';
import { FaMapMarkedAlt, FaHiking } from 'react-icons/fa'; // Importing Hiking icon from react-icons


const categories = [
  { name: 'Must See', icon: FaMapMarkedAlt, tag: 'must', link: '#maps' },
  { name: 'Islands', icon: GiIsland, tag: 'islands', link: '#islands' },
  { name: 'Food', icon: GiForkKnifeSpoon, tag: 'food', link: '#vegan' },
  { name: 'Hiking', icon: FaHiking, tag: 'hiking', link: '#hiking' },
];

// Reusable CategoryCard Component
const CategoryCard = ({ name, Icon, link }: { name: string; Icon: React.ElementType; link: string }) => {
  return (
    <a
      href={link}
      className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl font-secondary text-center transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      aria-label={`Explore ${name} category`}
      role="link"
    >
      <div className="mb-4 flex justify-center items-center">
        <div className="bg-blue-100 p-4 rounded-full transition duration-300 transform hover:scale-110">
          <Icon className="h-12 w-12 text-[#0878fe] transition duration-300 hover:text-blue-700" />
        </div>
      </div>
      <div className="text-lg font-semibold text-gray-800 hover:text-blue-700 transition duration-300">{name}</div>
    </a>
  );
};

export default function CategoryCards() {
  return (
    <section id="categories" className="py-16 bg-gray-100 mt-16 lg:mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-center font-primary text-3xl font-extrabold text-gray-900 mb-8">
          Explore Lists by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <CategoryCard key={cat.tag} name={cat.name} Icon={cat.icon} link={cat.link} />
          ))}
        </div>
      </div>
    </section>
  );
}