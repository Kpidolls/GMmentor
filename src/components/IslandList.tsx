import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import islands from '../data/islands.json';
import Image from 'next/image';

const IslandList = () => {
  const { t } = useTranslation();
  const [visibleIslands, setVisibleIslands] = useState(9);

  const isIsland = (id: string) => String(id || '').startsWith('island-');
  const getDestinationTypeLabel = (id: string) =>
    isIsland(id)
      ? t('destinationSearch.destinationTypeIsland', 'Island')
      : t('destinationSearch.destinationTypeMainland', 'Mainland');

  const handleViewMore = () => {
    setVisibleIslands(islands.length);
  };

  return (
    <div className="container mx-auto px-4 py-8" id="destinations">
      {/* <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 text-center tracking-tight drop-shadow-lg">
        {t('islands.title')}
      </h1> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {islands.slice(0, visibleIslands).map((island, index) => (
          <div
            key={index}
            id={island.id}
            className="group text-left rounded-xl border overflow-hidden transition-all duration-300 h-[360px] sm:h-[382px] lg:h-[400px] flex flex-col border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50 hover:shadow-md"
          >
            <div className="relative h-40 sm:h-44 w-full overflow-hidden">
              <Image
                src={island.img}
                alt={t(island.title)}
                fill
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="absolute top-2 right-2 text-[11px] px-2 py-1 rounded-full bg-white/90 border border-white text-gray-700 whitespace-nowrap">
                {getDestinationTypeLabel(island.id)}
              </span>
              <h3 className="absolute bottom-2 left-3 right-3 text-base sm:text-lg font-bold text-white leading-tight drop-shadow">
                {t(island.title)}
              </h3>
            </div>
            <div className="p-4 flex flex-col flex-1">
              <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 min-h-[60px] sm:min-h-[64px]">
                {t(island.description)}
              </p>

              <div className="mt-auto pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href={island.link}
                  target={island.target}
                  rel={island.rel}
                  className="px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg text-white transition-colors duration-200 text-center whitespace-nowrap truncate bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black"
                  aria-label={t('islands.openMapAria', 'Open map for islands')}
                >
                  <span className="sm:hidden">🗺️ {t('destinationSearch.openCuratedMapShort', 'Map')}</span>
                  <span className="hidden sm:inline">🗺️ {t('destinationSearch.openCuratedMap', 'Open Curated Map')}</span>
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
                  className="px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition-colors duration-200 whitespace-nowrap truncate bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200"
                  aria-label={t('islands.shareIslandAria', 'Share this island')}
                >
                  <span className="sm:hidden">🔗 {t('destinationSearch.shareMapShort', 'Share')}</span>
                  <span className="hidden sm:inline">🔗 {t('destinationSearch.shareMap', 'Share Map')}</span>
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
            aria-label={t('islands.viewMoreAria', 'View more')}
          >
            {t('islands.viewMoreButton')}
          </button>
        </div>
      )}
    </div>
  );
};

export default IslandList;