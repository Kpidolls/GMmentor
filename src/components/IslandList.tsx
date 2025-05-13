import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import islands from '../data/islands.json';

const IslandList = () => {
  const { t } = useTranslation();
  const [visibleIslands, setVisibleIslands] = useState(6);

  const handleViewMore = () => {
    setVisibleIslands(islands.length);
  };

  return (
    <div className="container mx-auto px-4 py-8" id="islands">
      <h1 className="text-4xl font-primary font-bold text-[#001c28] mb-8 text-center">
        {t('islands.title')}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {islands.slice(0, visibleIslands).map((island, index) => (
          <div
            key={index}
            id={island.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <img
              src={island.img}
              alt={t(island.title)} // Translated alt attribute
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg sm:text-xl font-semibold font-primary text-gray-800 mb-2 sm:mb-4 leading-tight">
                {t(island.title)} {/* Translated title */}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base font-secondary mb-6 leading-relaxed min-h-[48px] sm:min-h-[100px]">
                {t(island.description)} {/* Translated description */}
              </p>
              <div className="flex flex-wrap gap-4 mt-auto">
                <a
                  href={island.link}
                  target={island.target}
                  rel={island.rel}
                  className="flex-1 inline-block px-4 py-2 bg-[#0878fe] text-white font-semibold rounded shadow hover:bg-blue-700 transition duration-300 text-center"
                  aria-label={t('islands.explore', { title: t(island.title) })} // Translated aria-label
                >
                  {t('islands.exploreButton')}
                </a>
                <button
                  onClick={() => {
                    const shareText = t('islands.shareText', { title: t(island.title) });
                    if (navigator.share) {
                      navigator.share({
                        title: t(island.title),
                        text: shareText,
                        url: island.link,
                      });
                    } else {
                      alert(t('islands.shareNotSupported'));
                    }
                  }}
                  className="flex-1 inline-block px-4 py-2 bg-green-600 text-white font-semibold rounded shadow hover:bg-green-700 transition duration-300 text-center"
                  aria-label={t('islands.share', { title: t(island.title) })} // Translated aria-label
                >
                  {t('islands.shareButton')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {visibleIslands < islands.length && (
        <div className="mt-8 text-center">
          <button
            onClick={handleViewMore}
            className="px-6 py-3 bg-blue-600 font-primary text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
            aria-label={t('islands.viewMore')} // Translated aria-label
          >
            {t('islands.viewMoreButton')}
          </button>
        </div>
      )}
    </div>
  );
};

export default IslandList;