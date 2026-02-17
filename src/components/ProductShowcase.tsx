import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import defaultProducts from '../data/products.json';

interface Product {
  image: string;
  link: string;
  translationKey: string;
}

interface ProductShowcaseProps {
  products?: Product[];
}

const ProductShowcase: React.FC<ProductShowcaseProps> = ({ products = defaultProducts }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index if products length changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [products]);

  // Cycle through products every 5 seconds
  useEffect(() => {
    if (!products || products.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [products]);

  if (!products || products.length === 0) return null;
  const safeIndex = Math.min(currentIndex, products.length - 1);
  const product: Product | undefined = products[safeIndex];
  if (!product) return null;

  // Manual navigation handlers
  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };
  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  return (
    <section className="w-full flex flex-col items-center justify-center mt-10 mb-4 px-2 sm:px-4">
      {/* <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 text-center tracking-tight drop-shadow-lg">
        {t('productShowcaseTitle', { defaultValue: 'Travel Products' })}
      </h2> */}
      <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          aria-label={t('mainHero.prevProduct', { defaultValue: 'Previous Product' })}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-white/90 border border-gray-200 shadow hover:bg-blue-50 transition disabled:opacity-50 text-2xl"
          disabled={products.length < 2}
        >
          &#8592;
        </button>
        <button
          onClick={handleNext}
          aria-label={t('mainHero.nextProduct', { defaultValue: 'Next Product' })}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-white/90 border border-gray-200 shadow hover:bg-blue-50 transition disabled:opacity-50 text-2xl"
          disabled={products.length < 2}
        >
          &#8594;
        </button>
        {/* Product Card */}
        <div className="gyg-widget-container transition-all duration-300 min-h-[420px] sm:min-h-[440px] md:min-h-[480px] flex flex-col items-center">
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex-1 flex flex-col items-center group"
            style={{ minHeight: '320px' }}
          >
            <div
              className="w-full flex-1 flex items-center justify-center relative aspect-[4/3] sm:aspect-[16/9] bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 p-4"
              style={{
                borderRadius: '1rem',
                boxShadow: '0 4px 24px rgba(44,62,80,0.10)',
                border: '1.5px solid #e5e7eb',
                minHeight: '220px',
                maxHeight: '340px',
              }}
            >
              <img
                src={product.image}
                alt={t(`store.products.${product.translationKey}.name`)}
                className="object-contain w-full h-full rounded-xl shadow-md bg-white"
                loading="lazy"
                style={{
                  maxWidth: '100%',
                  maxHeight: '260px',
                  minHeight: '180px',
                  background: 'white',
                  padding: '0.5rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #f3f4f6',
                  boxShadow: '0 2px 8px rgba(44,62,80,0.08)',
                  transition: 'transform 0.3s',
                }}
              />
            </div>
            <div className="w-full px-6 py-4 flex flex-col items-center">
              <h3
                className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center truncate w-full"
                title={t(`store.products.${product.translationKey}.name`)}
              >
                {t(`store.products.${product.translationKey}.name`)}
              </h3>
                <span
                className="inline-block text-[#0878fe] font-semibold underline underline-offset-2 group-hover:text-[#0053b8] transition-colors text-base sm:text-lg"
                aria-label={t('aria.viewProductDetails', 'View product details')}
                >
                {t('mainHero.viewProduct', { defaultValue: 'View Product' })}
                </span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;