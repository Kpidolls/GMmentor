import React, { useState } from 'react';

const IslandList = () => {
  const islands = [
    {
      id: 'island-crete',
      title: '📍 Crete',
      img: '/assets/images/crete.jpg',
      description: 'Discover Crete, the largest Greek island, with its rich history, stunning landscapes and vibrant culture.',
      link: 'https://maps.app.goo.gl/Jqj9PF98pe3Pjbt86',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'island-mykonos',
      title: '📍 Mykonos',
      img: '/assets/images/mykonos.jpg',
      description: 'Experience Mykonos, famous for its vibrant nightlife, luxurious resorts and stunning sandy beaches.',
      link: 'https://maps.app.goo.gl/a5ydikhYtHbFqimq8',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'island-santorini',
      title: '📍 Santorini',
      img: '/assets/images/santorini.jpg',
      description: 'Visit Santorini, known for its iconic white-washed buildings, blue-domed churches and breathtaking sunsets.',
      link: 'https://maps.app.goo.gl/szbFdbDzFkxaYfjNA',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'island-aegina',
      title: '📍 Aegina',
      img: '/assets/images/aegina.jpg',
      description: 'Relax on Aegina, a charming island known for its pistachios, ancient temples and serene beaches.',
      link: 'https://maps.app.goo.gl/KFCFNepFpoeG9wGh9',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'island-rhodes',
      title: '📍 Rhodes (Rodos)',
      img: '/assets/images/rodos.webp',
      description: 'Explore Rhodes, a historic island with medieval charm, ancient ruins and beautiful beaches.',
      link: 'https://maps.app.goo.gl/tLQZpTA6oyRoNg1w9',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'island-corfu',
      title: '📍 Corfu (Kerkira)',
      img: '/assets/images/corfu.png',
      description: 'Discover Corfu, with its Venetian architecture, lush landscapes and stunning coastlines.',
      link: 'https://maps.app.goo.gl/9fSrbmQQu6eCHA6H9',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'island-paros',
      title: '📍 Paros',
      img: '/assets/images/paros.jpg',
      description: 'Enjoy Paros, with its golden beaches, traditional Cycladic villages and vibrant nightlife.',
      link: 'https://maps.app.goo.gl/N22ZNRRcEbj2kHQ36',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'island-karpathos',
      title: '📍 Karpathos',
      img: '/assets/images/karpathos.jpg',
      description: 'Visit Karpathos, a hidden gem with stunning beaches, traditional villages and unspoiled beauty.',
      link: 'https://maps.app.goo.gl/WMXHM2VfaxyM2s147',
      target: '_blank',
      rel: 'noopener noreferrer',
    }
  ];

  const [visibleIslands, setVisibleIslands] = useState(6); 

  const handleViewMore = () => {
    setVisibleIslands(islands.length);
  };

  return (
    <div className="container mx-auto px-4 py-8" id="islands">
      <h1 className="text-4xl font-primary font-bold text-[#001c28] mb-8 text-center">
        Explore Greek Islands
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
              alt={`Image of ${island.title}`} // Added descriptive alt attribute
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold font-primary text-gray-800 mb-2">
                {island.title}
              </h3>
              <p className="text-gray-600 text-sm font-secondary mb-2 sm:mb-4 h-6 sm:h-12">
                {island.description}
              </p>
              <a
                href={island.link}
                target="_self"
                rel={island.rel}
                className="inline-block mt-4 px-4 py-2 bg-[#0878fe] text-white font-semibold rounded shadow hover:bg-blue-700 transition duration-300 text-center"
                aria-label={`Explore ${island.title}`} // Added aria-label for the link
              >
                Explore
              </a>
              <button
                onClick={() => {
                  const shareText = `Recommendations for ${island.title} from Googlementor`;
                  if (navigator.share) {
                    navigator.share({
                      title: island.title,
                      text: shareText,
                      url: island.link,
                    });
                  } else {
                    alert('Sharing is not supported on this browser.');
                  }
                }}
                className="inline-block mt-4 ml-2 px-4 py-2 bg-green-600 text-white font-semibold rounded shadow hover:bg-green-700 transition duration-300 text-center"
                aria-label={`Share ${island.title}`} // Added aria-label for the button
              >
                Share
              </button>
            </div>
          </div>
        ))}
      </div>
      {visibleIslands < islands.length && (
        <div className="mt-8 text-center">
          <button
            onClick={handleViewMore}
            className="px-6 py-3 bg-primary font-primary text-white font-medium rounded-lg shadow-md hover:bg-secondary transition duration-300"
            aria-label="View more islands" // Added aria-label for the button
          >
            View More Islands
          </button>
        </div>
      )}
    </div>
  );
};

export default IslandList;