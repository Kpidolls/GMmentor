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
  }, [products.length]);

  // Cycle through products every 5 seconds
  useEffect(() => {
    if (!products || products.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [products.length]);

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
    <div className="w-full flex flex-col items-center justify-center mt-10 mb-4 px-2 sm:px-4">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0878fe] mb-6 text-center tracking-tight drop-shadow-lg">
         {t('productShowcaseTitle', { defaultValue: 'Travel Products' })}
      </h2>
      <div className="flex items-center w-full max-w-xs sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <button
          onClick={handlePrev}
          aria-label={t('mainHero.prevProduct', { defaultValue: 'Previous Product' })}
          className="p-2 sm:p-3 rounded-full bg-white border border-gray-200 shadow hover:bg-blue-50 transition disabled:opacity-50 text-xl sm:text-2xl"
          disabled={products.length < 2}
        >
          &#8592;
        </button>
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 group flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white/90 rounded-2xl shadow-2xl p-4 sm:p-6 mx-2 sm:mx-4 transition-all duration-300 hover:scale-105 hover:shadow-blue-200/60 backdrop-blur-md border border-gray-100 min-h-[10rem] sm:min-h-[9rem]"
        >
          <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200 shadow-md bg-gray-50 flex items-center justify-center">
            <img
              src={product.image}
              alt="Product Image"
              className="object-cover w-full h-full aspect-square transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
          </div>
          <div className="flex-1 text-left flex flex-col justify-center min-h-[5.5rem]">
            <h3
              className="text-base xs:text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 truncate sm:truncate lg:whitespace-normal lg:break-words"
              title={t(`store.products.${product.translationKey}.name`)}
            >
              {t(`store.products.${product.translationKey}.name`)}
            </h3>
            <span className="inline-block mt-2 text-[#0878fe] font-semibold underline underline-offset-2 group-hover:text-[#0053b8] transition-colors text-sm sm:text-base md:text-lg">
              {t('mainHero.viewProduct', { defaultValue: 'View Product' })}
            </span>
          </div>
        </a>
        <button
          onClick={handleNext}
          aria-label={t('mainHero.nextProduct', { defaultValue: 'Next Product' })}
          className="p-2 sm:p-3 rounded-full bg-white border border-gray-200 shadow hover:bg-blue-50 transition disabled:opacity-50 text-xl sm:text-2xl"
          disabled={products.length < 2}
        >
          &#8594;
        </button>
      </div>
    </div>
  );
};

export default ProductShowcase;