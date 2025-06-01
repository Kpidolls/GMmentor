'use client';

import React, { ComponentType } from 'react';
import { GiIsland, GiForkKnifeSpoon } from 'react-icons/gi';
import { FaMapMarkedAlt, FaHiking } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface CategoryItem {
  name: string;
  icon: ComponentType<{ className?: string }>;
  tag: string;
  link: string;
}

const categories: CategoryItem[] = [
  {
    name: 'categories.mustSee',
    icon: FaMapMarkedAlt,
    tag: 'must',
    link: 'https://maps.app.goo.gl/nh9QZAwzkh31DrqGA',
  },
  {
    name: 'categories.islands',
    icon: GiIsland,
    tag: 'islands',
    link: '#destinations',
  },
  {
    name: 'categories.food',
    icon: GiForkKnifeSpoon,
    tag: 'food',
    link: '#vegan',
  },
  {
    name: 'categories.hiking',
    icon: FaHiking,
    tag: 'hiking',
    link: 'https://maps.app.goo.gl/oZ8ZGmrR7n2MCBtG8',
  },
];

interface CategoryCardProps {
  name: string;
  Icon: ComponentType<{ className?: string }>;
  link: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, Icon, link }) => {
  const { t } = useTranslation();
  const isExternal = link.startsWith('http');

  return (
    <a
      href={link}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-transform duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0878fe]"
      aria-label={t('aria.exploreCategory', { name: t(name) })}
    >
      <div className="flex justify-center items-center mb-4">
        <div className="bg-[#e5f1ff] p-4 rounded-full group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-10 h-10 text-[#0878fe] group-hover:text-blue-700 transition-colors duration-300" />
        </div>
      </div>
      <p className="text-center text-base sm:text-lg font-semibold text-gray-800 group-hover:text-[#0878fe] transition-colors duration-300">
        {t(name)}
      </p>
    </a>
  );
};

export default function CategoryCards() {
  const { t } = useTranslation();

  return (
    <section id="categories" className="py-8 bg-gray-50 mt-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 text-center tracking-tight drop-shadow-lg">
          {t('categories.title')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map(({ tag, name, icon, link }) => (
            <CategoryCard
              key={tag}
              name={name}
              Icon={icon}
              link={link}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
