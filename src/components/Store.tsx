import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import products from '../data/products.json';

const Store: React.FC = () => {
  const { t } = useTranslation();
  const [visibleProducts, setVisibleProducts] = useState(16);
  const [filter, setFilter] = useState<'all' | 'amazon' | 'temu'>('all'); // Filter state

  const handleViewMore = () => {
    setVisibleProducts((prev) => prev + 16);
  };

  const filteredProducts = products.filter((product) => {
    if (filter === 'amazon') return product.link.includes('amazon');
    if (filter === 'temu') return product.link.includes('temu');
    return true; // 'all' filter
  });

  return (
    <div id="store" className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h2 className="text-3xl font-extrabold font-secondary-primary text-gray-900 sm:text-4xl text-center">
          {t('store.title')}
        </h2>
        {/* <p className="mt-4 text-lg text-gray-600 font-secondary text-center">
          {t('store.subtitle')}
        </p> */}

        {/* Filter Buttons */}
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 font-medium rounded-lg shadow-md transition duration-300 ${
              filter === 'all' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            {t('store.filters.all')}
          </button>
          <button
            onClick={() => setFilter('amazon')}
            className={`px-4 py-2 font-medium rounded-lg shadow-md transition duration-300 ${
              filter === 'amazon' ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            {t('store.filters.amazon')}
          </button>
          <button
            onClick={() => setFilter('temu')}
            className={`px-4 py-2 font-medium rounded-lg shadow-md transition duration-300 ${
              filter === 'temu' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            {t('store.filters.temu')}
          </button>
        </div>

        {/* Product Grid */}
        <div
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
        >
          {filteredProducts.slice(0, visibleProducts).map((product) => (
            <div
              key={product.id}
              className="bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              {/* Product Image */}
              <a
                href={product.link}
                target="_self"
                rel="noopener noreferrer"
                aria-label={t('store.learnMore', { name: t(product.name) })}
                className="block"
              >
                <img
                  src={product.image}
                  alt={t('store.imageAlt', { name: t(product.name) })}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </a>

              {/* Product Details */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg sm:text-xl font-semibold font-primary text-gray-800 mb-2 sm:mb-4 leading-tight min-h-[48px] sm:min-h-[56px]">
                  {t(product.name)}
                </h3>

                <p className="text-gray-600 font-secondary text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
                  {t(product.description)}
                </p>

                {/* Horizontal Alignment for Label and Button */}
                <div className="mt-auto flex items-center justify-between">
                  {/* Product Label */}
                  <a
                    href={product.link}
                    target="_self"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded ${
                      product.link.includes('amazon')
                        ? 'bg-black text-white'
                        : product.link.includes('temu')
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-300 text-gray-800'
                    }`}
                    aria-label={t('store.learnMore', { name: t(product.name) })}
                  >
                    {product.link.includes('amazon')
                      ? 'Amazon'
                      : product.link.includes('temu')
                      ? 'Temu'
                      : 'Buy Now'}
                  </a>

                  {/* Learn More Button */}
                  <a
                    href={product.link}
                    target="_self"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-[#0878fe] text-white font-medium rounded shadow hover:bg-blue-700 transition duration-300 text-center"
                    aria-label={t('store.learnMore', { name: t(product.name) })}
                  >
                    {t('store.products.learnMoreButton')}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        {visibleProducts < filteredProducts.length && (
          <div className="mt-8 text-center">
            <button
              onClick={handleViewMore}
              className="px-6 py-3 bg-primary text-white font-secondary font-medium rounded-lg shadow-md hover:bg-secondary transition duration-300"
              aria-label={t('store.viewMore')}
            >
              {t('store.products.viewMoreButton')}
            </button>
          </div>
        )}

        {/* Footer Note */}
        <p className="mt-8 text-sm text-gray-500 font-secondary text-center">
          {t('store.products.footerNote')}
        </p>
      </div>
    </div>
  );
};

export default Store;