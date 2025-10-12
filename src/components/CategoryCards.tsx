'use client';

import React, { ComponentType } from 'react';
import { GiIsland, GiForkKnifeSpoon } from 'react-icons/gi';
import { FaMapMarkedAlt, FaHiking, FaExternalLinkAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface CategoryItem {
  name: string;
  icon: ComponentType<{ className?: string }>;
  tag: string;
  link: string;
  description: string;
}

const categories: CategoryItem[] = [
  {
    name: 'categories.mustSee',
    icon: FaMapMarkedAlt,
    tag: 'must',
    link: 'https://maps.app.goo.gl/nh9QZAwzkh31DrqGA',
    description: 'categories.mustSeeDesc',
  },
  {
    name: 'categories.islands',
    icon: GiIsland,
    tag: 'islands',
    link: '#destinations',
    description: 'categories.islandsDesc',
  },
  {
    name: 'categories.food',
    icon: GiForkKnifeSpoon,
    tag: 'food',
    link: '#vegan',
    description: 'categories.foodDesc',
  },
  {
    name: 'categories.hiking',
    icon: FaHiking,
    tag: 'hiking',
    link: 'https://maps.app.goo.gl/oZ8ZGmrR7n2MCBtG8',
    description: 'categories.hikingDesc',
  },
];

interface CategoryCardProps {
  name: string;
  Icon: ComponentType<{ className?: string }>;
  link: string;
  description: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, Icon, link, description }) => {
  const { t } = useTranslation();
  const isExternal = link.startsWith('http');

  return (
    <a
      href={link}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="group relative bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-[#0878fe]/20 transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0878fe] overflow-hidden p-4"
      aria-label={t('aria.exploreCategory', { name: t(name) })}
    >
      {/* Subtle background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#0878fe]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        {/* Icon and External Link Indicator */}
        <div className="flex items-center justify-between mb-3">
          <div className="bg-gradient-to-br from-[#e5f1ff] to-[#d1e9ff] p-3 rounded-lg group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-6 h-6 text-[#0878fe] group-hover:text-[#0053b8] transition-colors duration-300" />
          </div>
          
          {isExternal && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <FaExternalLinkAlt className="w-3 h-3 text-gray-400 group-hover:text-[#0878fe]" />
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          <h3 className="font-semibold font-primary text-gray-800 group-hover:text-[#0878fe] transition-colors duration-300 mb-1 text-sm sm:text-base">
            {t(name)}
          </h3>
          
          <p className="text-xs sm:text-sm text-gray-600 font-secondary leading-relaxed group-hover:text-gray-700 transition-colors duration-300 line-clamp-2">
            {t(description, t(name))}
          </p>
        </div>

        {/* Action indicator */}
        <div className="mt-3 flex items-center text-[#0878fe] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
          <span className="text-xs font-medium">
            {t('categories.explore', 'Explore')}
          </span>
          <svg 
            className="ml-1 w-3 h-3 transform group-hover:translate-x-1 transition-transform duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        </div>
      </div>
    </a>
  );
};

export default function CategoryCards() {
  const { t } = useTranslation();

  return (
    <section id="categories" className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 font-primary tracking-tight">
            {t('categories.title')}
          </h2>
          <p className="text-base text-gray-600 font-secondary max-w-xl mx-auto">
            {t('categories.subtitle', 'Discover Greece through our carefully curated collections')}
          </p>
        </div>

        {/* Categories Grid - Compact cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.map(({ tag, name, icon, link, description }) => (
            <CategoryCard
              key={tag}
              name={name}
              Icon={icon}
              link={link}
              description={description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
