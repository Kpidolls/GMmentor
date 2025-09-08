import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import islands from '../data/islands.json';
import Image from 'next/image';

const IslandList = () => {
  const { t } = useTranslation();
  const [visibleIslands, setVisibleIslands] = useState(9);

  const handleViewMore = () => {
    setVisibleIslands(islands.length);
  };

  return (
    <div className="container mx-auto px-4 py-8" id="destinations">
      {/* <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 text-center tracking-tight drop-shadow-lg">
        {t('islands.title')}
      </h1> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {islands.slice(0, visibleIslands).map((island, index) => (
          <div
            key={index}
            id={island.id}
            className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
          >
            <div className="relative w-full h-48">
              <Image
                src={island.img}
                alt={t(island.title)}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority={index < 3}
              />
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-lg sm:text-xl font-semibold font-primary text-gray-800 mb-2 sm:mb-4 leading-tight text-center group-hover:text-[#0878fe] transition-colors duration-300">
                {t(island.title)}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base font-secondary mb-6 leading-relaxed min-h-[48px] sm:min-h-[100px] text-center">
                {t(island.description)}
              </p>
              <div className="flex flex-wrap gap-4 mt-auto justify-center">
                <a
                  href={island.link}
                  target={island.target}
                  rel={island.rel}
                  className="flex-1 min-w-[120px] inline-block px-4 py-2 bg-[#0878fe] text-white font-semibold rounded shadow hover:bg-blue-700 transition duration-300 text-center"
                  aria-label="Open map for islands"
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
                  className="flex-1 min-w-[120px] inline-block px-4 py-2 bg-green-600 text-white font-semibold rounded shadow hover:bg-green-700 transition duration-300 text-center"
                  aria-label="Share this island"
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
            aria-label="View more"
          >
            {t('islands.viewMoreButton')}
          </button>
        </div>
      )}
    </div>
  );
};

export default IslandList;