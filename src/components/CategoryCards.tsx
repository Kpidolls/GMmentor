import React from 'react';
import { GiIsland, GiForkKnifeSpoon } from 'react-icons/gi';
import { FaMapMarkedAlt, FaHiking } from 'react-icons/fa';
import { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';

// Define the categories array with proper typing
const categories = [
  { name: 'categories.mustSee', icon: FaMapMarkedAlt, tag: 'must', link: 'https://maps.app.goo.gl/nh9QZAwzkh31DrqGA' },
  { name: 'categories.islands', icon: GiIsland, tag: 'islands', link: '#destinations' },
  { name: 'categories.food', icon: GiForkKnifeSpoon, tag: 'food', link: '#vegan' },
  { name: 'categories.hiking', icon: FaHiking, tag: 'hiking', link: 'https://maps.app.goo.gl/oZ8ZGmrR7n2MCBtG8' },
];

// Define the props for the CategoryCard component
interface CategoryCardProps {
  name: string;
  Icon: ComponentType<{ className?: string }>;
  link: string;
}

// Reusable CategoryCard Component
const CategoryCard: React.FC<CategoryCardProps> = ({ name, Icon, link }) => {
  const { t } = useTranslation();

  const isExternalLink = link.startsWith('https://'); 

  return (
    <a
      href={link}
      target={isExternalLink ? "_blank" : undefined} 
      rel={isExternalLink ? "noopener noreferrer" : undefined} 
      className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl font-secondary text-center transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      aria-label={t(`aria.exploreCategory`, { name: t(name) })}
      role="link"
    >
      <div className="mb-4 flex justify-center items-center">
        <div className="bg-blue-100 p-4 rounded-full transition duration-300 transform hover:scale-110">
          <Icon className="h-12 w-12 text-[#0878fe] transition duration-300 hover:text-blue-700" />
        </div>
      </div>
      <div className="text-lg font-semibold text-gray-800 hover:text-blue-700 transition duration-300">
        {t(name)}
      </div>
    </a>
  );
};

// Main CategoryCards Component
export default function CategoryCards() {
  const { t } = useTranslation();

  return (
    <section id="categories" className="py-16 bg-gray-100 mt-16 lg:mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-center font-primary text-3xl font-extrabold text-gray-900 mb-8">
          {t('categories.title')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.tag}
              name={cat.name}
              Icon={cat.icon as React.ComponentType<{ className?: string }>}
              link={cat.link}
            />
          ))}
        </div>
      </div>
    </section>
  );
}