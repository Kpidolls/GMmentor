import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import islands from '../data/islands.json';
import Image from 'next/image';
import Link from 'next/link';
import { dispatchAddToItinerary } from '../utils/itineraryEvents';

type IslandEntry = {
  id: string;
  title: string;
  img: string;
  locationImg?: string;
  description: string;
  link: string;
  target?: string;
  rel?: string;
};

const IslandList = () => {
  const { t } = useTranslation();
  const [visibleIslands, setVisibleIslands] = useState(9);

  const isIsland = (id: string) => String(id || '').startsWith('island-');
  const getDestinationTypeLabel = (id: string) =>
    isIsland(id)
      ? t('destinationSearch.destinationTypeIsland', 'Island')
      : t('destinationSearch.destinationTypeMainland', 'Mainland');
  const getMapListTitle = (title: string) =>
    t('destination.itineraryMapTitle', {
      destination: title,
      defaultValue: '{{destination}} Points of Interest Map',
    });
  const getDestinationDetailsPath = (id: string) => `/destination/${encodeURIComponent(String(id || '').trim())}`;

  const handleViewMore = () => {
    setVisibleIslands(islands.length);
  };

  return (
    <div className="container mx-auto px-4 py-8" id="destinations">
      {/* <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 text-center tracking-tight drop-shadow-lg">
        {t('islands.title')}
      </h1> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(islands as IslandEntry[]).slice(0, visibleIslands).map((island, index) => (
          <div
            key={index}
            id={island.id}
            className="group text-left rounded-xl border overflow-hidden transition-all duration-300 h-[404px] sm:h-[402px] lg:h-[420px] flex flex-col border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50 hover:shadow-md"
          >
            <div className="relative h-60 sm:h-56 w-full overflow-hidden bg-slate-100">
              <div className="grid h-full grid-rows-[6fr_5fr] sm:grid-rows-[7fr_4fr]">
                <div className="relative overflow-hidden">
                  <Image
                    src={island.img}
                    alt={t(island.title)}
                    fill
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-transparent" />
                </div>
                <div className="relative border-t border-white/50 p-1.5 sm:p-2.5 bg-slate-100">
                  <div className="relative h-full w-full overflow-hidden rounded-md ring-1 ring-slate-300/70 bg-sky-100/80">
                    <Image
                      src={island.locationImg || island.img}
                      alt=""
                      aria-hidden="true"
                      fill
                      className="h-full w-full object-cover blur-sm scale-105 opacity-40"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <Image
                      src={island.locationImg || island.img}
                      alt={t('islands.locationScreenshotAlt', {
                        title: t(island.title),
                        defaultValue: '{{title}} locations screenshot',
                      })}
                      fill
                      className="relative z-10 h-full w-full object-contain p-0.5 sm:p-1 transition-transform duration-500 ease-out group-hover:scale-[1.01]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <span className="absolute left-2 top-2 text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded bg-slate-900/70 text-white tracking-wide">
                      {t('destination.mapPreview', 'Map preview')}
                    </span>
                  </div>
                </div>
              </div>
              <span className="absolute top-2 right-2 text-[11px] px-2 py-1 rounded-full bg-white/90 border border-white text-gray-700 whitespace-nowrap">
                {getDestinationTypeLabel(island.id)}
              </span>
            </div>
            <div className="p-4 sm:p-4.5 flex flex-col flex-1">
              <h3 className="text-[15px] sm:text-[18px] font-semibold tracking-tight text-slate-900 leading-snug mb-1.5">
                {t(island.title)}
              </h3>
              <p className="text-[12px] sm:text-[13px] text-slate-600 leading-relaxed line-clamp-3 min-h-[60px] sm:min-h-[64px]">
                {t(island.description)}
              </p>

              <div className="mt-auto pt-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                <Link
                  href={getDestinationDetailsPath(island.id)}
                  className="inline-flex items-center justify-center min-h-11 px-3 py-2 text-[11px] sm:text-[13px] font-semibold tracking-tight rounded-lg text-white text-center leading-snug whitespace-normal bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black transition-colors duration-200"
                  aria-label={t('destination.viewFullListAria', 'View full list details for this destination')}
                >
                  <span className="sm:hidden">📋 {t('destination.viewFullListShort', 'Details')}</span>
                  <span className="hidden sm:inline">📋 {t('destination.viewFullList', 'View Full List Details')}</span>
                </Link>
                <button
                  onClick={() => {
                    const shareText = t('islands.shareText', { title: t(island.title) });
                    if (navigator.share) {
                      navigator.share({
                        title: t(island.title),
                        text: shareText,
                        url: getDestinationDetailsPath(island.id),
                      });
                    } else {
                      alert(t('islands.shareNotSupported'));
                    }
                  }}
                  className="inline-flex items-center justify-center min-h-11 px-3 py-2 text-[11px] sm:text-[13px] font-semibold tracking-tight rounded-lg border transition-colors duration-200 text-center leading-snug whitespace-normal bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200"
                  aria-label={t('islands.shareIslandAria', 'Share this island')}
                >
                  <span className="sm:hidden">🔗 {t('destinationSearch.shareMapShort', 'Share')}</span>
                  <span className="hidden sm:inline">🔗 {t('destinationSearch.shareMap', 'Share Map')}</span>
                </button>
                <button
                  onClick={() =>
                    dispatchAddToItinerary({
                      id: island.id,
                      name: getMapListTitle(t(island.title)),
                      type: 'guide',
                      url: island.link,
                      notes: t('destination.itineraryMapNote', {
                        destination: t(island.title),
                        defaultValue:
                          'Map stop: this Google Maps list highlights the most important places in {{destination}}. Open it anytime to browse must-see spots and plan your route.',
                      }),
                    })
                  }
                  className="inline-flex items-center justify-center min-h-11 sm:min-h-12 px-3 py-2.5 text-[11px] sm:text-[13px] font-semibold tracking-tight rounded-lg border transition-colors duration-200 text-center leading-snug whitespace-normal bg-teal-50 border-teal-300 text-teal-800 hover:bg-teal-100"
                  aria-label={t('place.addToItinerary', 'Add to itinerary')}
                >
                  <span className="sm:hidden">➕ {t('destinationSearch.addShort', 'Add')}</span>
                  <span className="hidden sm:inline">➕ {t('place.addToItinerary', 'Add to itinerary')}</span>
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
            className="px-6 py-3 bg-blue-600 font-primary text-white text-sm font-semibold tracking-tight rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
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