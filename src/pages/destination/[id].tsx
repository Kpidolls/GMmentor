import Head from 'next/head';
import Link from 'next/link';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useTranslation } from 'react-i18next';
import islandsData from '../../data/islands.json';
import { buildDestinationMetaDescription } from '../../config/metaDescriptions';
import { dispatchAddToItinerary } from '../../utils/itineraryEvents';

type DestinationEntry = {
  id: string;
  title: string;
  img: string;
  locationImg?: string;
  description: string;
  link: string;
  target?: string;
  rel?: string;
  keywords?: string[];
};

type DestinationPageProps = {
  destination: DestinationEntry;
};

const normalizeId = (value: string) => String(value || '').trim();

export const getStaticPaths: GetStaticPaths = async () => {
  const destinations = islandsData as DestinationEntry[];
  const paths = destinations
    .map((destination) => normalizeId(destination.id))
    .filter(Boolean)
    .map((id) => ({ params: { id } }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<DestinationPageProps> = async ({ params }) => {
  const requestedId = normalizeId(String(params?.id || ''));
  const destinations = islandsData as DestinationEntry[];
  const destination = destinations.find((entry) => normalizeId(entry.id) === requestedId) || null;

  if (!destination) {
    return { notFound: true };
  }

  return {
    props: {
      destination: {
        ...destination,
        id: normalizeId(destination.id),
      },
    },
  };
};

const DestinationPage = ({ destination }: DestinationPageProps) => {
  const { t, i18n } = useTranslation();
  const destinationName = t(destination.title, destination.id);
  const destinationSummary = t(
    destination.description,
    'Curated points of interest, local favorites, and practical map guidance for your destination in Greece.'
  );
  const destinationDescription = buildDestinationMetaDescription({
    destinationName,
    summary: destinationSummary,
    language: i18n.language,
  });
  const mapListTitle = t('destination.itineraryMapTitle', {
    destination: destinationName,
    defaultValue: '{{destination}} Points of Interest Map',
  });
  const canonicalUrl = `https://googlementor.com/destination/${encodeURIComponent(destination.id)}`;

  const destinationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: destinationName,
    description: destinationDescription,
    image: [
      `https://googlementor.com${destination.img}`,
      `https://googlementor.com${destination.locationImg || destination.img}`,
    ],
    url: canonicalUrl,
    touristType: ['Travelers', 'Families', 'Food lovers'],
    subjectOf: {
      '@type': 'WebPage',
      name: `${destinationName} points of interest map`,
      url: destination.link,
    },
  };

  return (
    <>
      <Head>
        <title>{`${destinationName} ${t('destination.metaTitleSuffix', 'Points of Interest Map')} | Googlementor`}</title>
        <meta name="description" content={destinationDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${destinationName} ${t('destination.metaTitleSuffix', 'Points of Interest Map')}`} />
        <meta property="og:description" content={destinationDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={`https://googlementor.com${destination.img}`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(destinationJsonLd) }} />
      </Head>

      <main className="min-h-screen bg-slate-50 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50">
            <img src={destination.img} alt={destinationName} className="w-full h-64 sm:h-80 lg:h-96 object-cover" loading="eager" />
            <div className="px-3 py-3 sm:px-6 sm:py-4">
              <div className="max-w-4xl mx-auto rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                <p className="text-[11px] sm:text-xs uppercase tracking-[0.18em] text-slate-500 px-3 py-2 border-b border-slate-200">
                  {t('destination.mapPreview', 'Map preview')}
                </p>
                <div className="relative w-full h-40 sm:h-48 lg:h-52 overflow-hidden bg-slate-200">
                  <img
                    src={destination.locationImg || destination.img}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-md scale-105 opacity-40"
                    loading="eager"
                  />
                  <img
                    src={destination.locationImg || destination.img}
                    alt={t('islands.locationScreenshotAlt', {
                      title: destinationName,
                      defaultValue: '{{title}} locations screenshot',
                    })}
                    className="relative z-10 w-full h-full object-contain p-1"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-slate-500 mb-3">
              {t('destination.pageLabel', 'Destination Guide')}
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">{destinationName}</h1>
            <p className="text-slate-600 text-[15px] sm:text-base leading-relaxed mb-8">{destinationSummary}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <a
                href={destination.link}
                target={destination.target || '_blank'}
                rel={destination.rel || 'noopener noreferrer'}
                className="inline-flex items-center justify-center min-h-12 px-5 py-3 rounded-xl bg-blue-700 text-white text-sm sm:text-[15px] font-semibold tracking-tight text-center leading-snug whitespace-normal hover:bg-blue-800 transition-colors"
              >
                {t('destination.openMap', 'Open Points of Interest Map')}
              </a>
              <button
                type="button"
                className="inline-flex items-center justify-center min-h-12 sm:min-h-[52px] px-5 py-3 rounded-xl border border-teal-300 text-teal-800 text-sm sm:text-[15px] font-semibold tracking-tight text-center leading-snug whitespace-normal hover:bg-teal-50 transition-colors"
                onClick={() =>
                  dispatchAddToItinerary({
                    id: destination.id,
                    name: mapListTitle,
                    type: 'guide',
                    url: destination.link,
                    notes: t(
                      'destination.itineraryMapNote',
                      {
                        destination: destinationName,
                        defaultValue:
                          'Map stop: this Google Maps list highlights the most important places in {{destination}}. Open it anytime to browse must-see spots and plan your route.'
                      }
                    ),
                  })
                }
              >
                {t('destination.addToItinerary', 'Add to itinerary')}
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center min-h-12 px-5 py-3 rounded-xl border border-slate-300 text-slate-700 text-sm sm:text-[15px] font-semibold tracking-tight text-center leading-snug whitespace-normal hover:bg-slate-100 transition-colors"
              >
                {t('destination.backHome', 'Back to Home')}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default DestinationPage;
