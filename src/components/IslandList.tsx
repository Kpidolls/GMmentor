import React, { useState } from 'react';

const IslandList = () => {
  const islands = [
    {
      title: '📍 Crete',
      img: '/assets/images/crete.jpg',
      description: 'Explore the largest island in Greece.',
      link: 'https://www.google.com/maps/@35.2224747,24.2463809,9z/data=!4m6!1m2!10m1!1e1!11m2!2sFTETPqu5SnCRdQay7V_1Sg!3e3?entry=ttu&g_ep=EgoyMDI1MDQwNi4wIKXMDSoJLDEwMjExNDUzSAFQAw%3D%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      title: '📍 Mykonos',
      img: '/assets/images/mykonos.jpg',
      description: 'Famous for its vibrant nightlife and stunning beaches.',
      link: 'https://www.google.com/maps/@37.4465034,25.3322637,13z/data=!4m6!1m2!10m1!1e1!11m2!2s3MoX6nc_ZdjjfzeqDl8yrPxndecUBg!3e3?entry=ttu&g_ep=EgoyMDI1MDQwNi4wIKXMDSoJLDEwMjExNDUzSAFQAw%3D%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      title: '📍 Santorini',
      img: '/assets/images/santorini.jpg',
      description: 'Known for its iconic buildings and breathtaking sunsets.',
      link: 'https://www.google.com/maps/@36.4011997,25.3458446,12z/data=!4m6!1m2!10m1!1e1!11m2!2sPmNDSpvFTOKdewcPsf3wWw!3e3?entry=ttu&g_ep=EgoyMDI1MDQwNi4wIKXMDSoJLDEwMjExNDUzSAFQAw%3D%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      title: '📍 Aegina',
      img: '/assets/images/aegina.jpg',
      description: 'A charming island known for its pistachios and beaches.',
      link: 'https://www.google.com/maps/@38.3439154,22.7742935,9z/data=!4m6!1m2!10m1!1e1!11m2!2scggsZ8QVwRlQtKRLL9dzUya6aEWP_A!3e3?entry=ttu&g_ep=EgoyMDI1MDQwNi4wIKXMDSoJLDEwMjExNDUzSAFQAw%3D%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      title: '📍 Rhodes (Rodos)',
      img: '/assets/images/rodos.jpg',
      description: 'Discover medieval charm and beautiful beaches.',
      link: 'https://www.google.com/maps/@36.1723163,27.6523371,10z/data=!4m6!1m2!10m1!1e1!11m2!2s9gWD1lJsTiCAh7juAHOsZQ!3e3?entry=ttu&g_ep=EgoyMDI1MDQwNi4wIKXMDSoJLDEwMjExNDUzSAFQAw%3D%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      title: '📍 Corfu (Kerkira)',
      img: '/assets/images/corfu.jpg',
      description: 'Venetian architecture and stunning coastlines.',
      link: 'https://www.google.com/maps/@39.582828,19.542064,10z/data=!4m6!1m2!10m1!1e1!11m2!2sHQ0OGiP3TN-0BVrAqqsQog!3e3?entry=ttu&g_ep=EgoyMDI1MDQwNi4wIKXMDSoJLDEwMjExNDUzSAFQAw%3D%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      title: '📍 Zakynthos',
      img: '/assets/images/zakynthos.jpg',
      description: 'Home to the famous Navagio Beach and crystal-clear waters.',
      link: 'https://www.google.com/maps/@37.7911093,20.6425114,11z/data=!4m6!1m2!10m1!1e1!11m2!2s3Gy3UZ1xSGeHnXSGZN_BgA!3e3?entry=ttu&g_ep=EgoyMDI1MDQwOS4wIKXMDSoJLDEwMjExNDUzSAFQAw%3D%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    // {
    //   title: '📍 Paros',
    //   img: '/assets/images/paros.webp',
    //   description: 'A charming island with traditional villages and sandy beaches.',
    //   link: '',
    //   target: '_blank',
    //   rel: 'noopener noreferrer',
    // },
    // {
    //   title: '📍 Naxos',
    //   img: '/assets/images/naxos.webp',
    //   description: 'The largest Cycladic island, offering rich history and beautiful landscapes.',
    //   link: '',
    //   target: '_blank',
    //   rel: 'noopener noreferrer',
    // },
    {
      title: '📍 Karpathos',
      img: '/assets/images/karpathos.jpg',
      description: 'Stunning beaches and traditional villages.',
      link: 'https://www.google.com/maps/@36.7946282,22.5294794,8z/data=!4m6!1m2!10m1!1e1!11m2!2s1kM2FOdmaKnuCrFKFqG9imJg2d9EGg!3e3?entry=ttu&g_ep=EgoyMDI1MDQwOS4wIKXMDSoJLDEwMjExNDUzSAFQAw%3D%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    }
  ];

  const [visibleIslands, setVisibleIslands] = useState(3); // Initially show 6 islands

  const handleViewMore = () => {
    setVisibleIslands(islands.length); 
  };

  return (
    <div className="container mx-auto px-4 py-8" id="islands">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        Explore Greek Islands
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {islands.slice(0, visibleIslands).map((island, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <img
              src={island.img}
              alt={island.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {island.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {island.description}
              </p>
              <a
                href={island.link}
                target={island.target}
                rel={island.rel}
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded shadow hover:bg-blue-700 transition duration-300 text-center"
              >
                Explore
              </a>
              <button
                onClick={() => {
                  const shareText = `Check out this amazing category: ${island.title} - ${island.description} ${island.link}`;
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
            className="px-6 py-3 bg-primary text-white font-medium rounded-lg shadow-md hover:bg-secondary transition duration-300"
          >
            View More Islands
          </button>
        </div>
      )}
    </div>
  );
};

export default IslandList;