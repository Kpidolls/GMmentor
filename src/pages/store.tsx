import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import productsData from '../data/products.json';

const Store: React.FC = () => {
  const { t } = useTranslation();
  const [visibleProducts, setVisibleProducts] = useState(16);
  const [filter, setFilter] = useState<'all' | 'amazon' | 'temu'>('all');
  const [filteredProducts, setFilteredProducts] = useState(productsData);

  useEffect(() => {
    const updatedProducts = productsData.filter((product) => {
      if (filter === 'amazon') return product.link?.includes('amazon');
      if (filter === 'temu') return product.link?.includes('temu');
      return true;
    });
    setFilteredProducts(updatedProducts);
  }, [filter]);

  return (
    <main className="bg-gray-50 min-h-screen">
      <Head>
        <title>{t('store.meta.title', { defaultValue: 'Travel Gear Store' })}</title>
        <meta
          name="description"
          content={t('store.meta.description', {
            defaultValue: 'Browse and shop top-rated travel gear, accessories, and essentials from Amazon and Temu. Find curated products to make your journeys easier and more enjoyable with Googlementor.',
          })}
        />
        <link rel="canonical" href="https://googlementor.com/store" />
      </Head>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            {t('store.title', { defaultValue: 'Travel Gear' })}
          </h1>
        </div>

        {/* Filter Buttons */}
        <div className="mt-1 flex flex-wrap justify-center gap-4">
            {['all', 'amazon', 'temu'].map((key) => (
            <button
              type="button"
              key={key}
              onClick={() => setFilter(key as 'all' | 'amazon' | 'temu')}
              className={`px-4 py-2 font-medium rounded-lg shadow-md transition duration-300 ${
              filter === key
                ? key === 'amazon'
                ? 'bg-black text-white'
                : key === 'temu'
                ? 'bg-orange-500 text-white'
                : 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
              }`}
            >
              {t(`filters.${key}`, { defaultValue: key.charAt(0).toUpperCase() + key.slice(1) })}
            </button>
            ))}
        </div>

        {/* Product Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredProducts.slice(0, visibleProducts).map((product) => (
            <div
              key={product.id || product.name}
              className="bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              <a
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={product.image || '/placeholder.jpg'}
                  alt={t('imageAlt', { name: t(product.name, { defaultValue: product.name }) })}
                  className="w-full aspect-square object-cover rounded-t-lg"
                />
              </a>
              <div className="p-6 flex flex-col flex-grow">
                <h3
                  className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-4 leading-tight min-h-[2.5em] sm:min-h-[3em]"
                >
                  {t(product.name, { defaultValue: product.name })}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
                  {t(product.description, { defaultValue: product.description })}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <a
                    href={product.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded ${
                      product.link?.includes('amazon')
                        ? 'bg-black text-white'
                        : product.link?.includes('temu')
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-300 text-gray-800'
                    }`}
                  >
                    {product.link?.includes('amazon')
                      ? 'Amazon'
                      : product.link?.includes('temu')
                      ? 'Temu'
                      : 'Buy Now'}
                  </a>
                  <a
                    href={product.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-blue-600 text-white font-medium rounded shadow hover:bg-blue-700 transition duration-300 text-center"
                  >
                    {t('store.products.learnMoreButton', { defaultValue: 'Learn More' })}
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
              onClick={() => setVisibleProducts((prev) => prev + 16)}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
            >
              {t('store.products.viewMoreButton', { defaultValue: 'View More' })}
            </button>
          </div>
        )}

        {/* Footer Note */}
        <p className="mt-8 text-sm text-gray-500 text-center">
          {t('store.products.footerNote', {
            defaultValue: 'Discover the best products for your travel needs.',
          })}
        </p>
      </div>
    </main>
  );
};

export default Store;
