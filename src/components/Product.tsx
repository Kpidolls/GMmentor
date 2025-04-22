import React, { useState } from 'react';

const Product = () => {
  const mapOptions = [
    {
      id: 'must-see',
      title: '📍 Must-See Attractions',
      img: '/assets/images/must.png',
      description: 'Discover must-see attractions, from ancient ruins to breathtaking landscapes.',
      link: 'https://maps.app.goo.gl/iDRPEgDRk7v8rpJj6',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'hiking',
      title: '📍 Hiking Trails',
      img: '/assets/images/hiking.webp',
      description: 'Explore the best hiking trails, offering stunning views and unforgettable experiences.',
      link: 'https://maps.app.goo.gl/1qjPVDcEhx1p4dcy8',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'rooftop',
      title: '📍 Rooftop Lounges',
      img: '/assets/images/rooftop.png',
      description: 'Enjoy the view at the best rooftop lounges, perfect for unwinding after a long day.',
      link: 'https://maps.app.goo.gl/XJLd73anECFR8jBC6',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'churches',
      title: '📍 Monasteries & Churches',
      img: '/assets/images/church.jpg',
      description: 'Historic monasteries and beautiful churches that showcase Greece’s rich cultural heritage.',
      link: 'https://maps.app.goo.gl/y7bCep89uvZN7d9U9',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'vegan',
      title: '📍 Vegetarian Friendly',
      img: '/assets/images/vegan.webp',
      description: 'Find vegan and vegetarian-friendly spots that cater to a variety of dietary preferences.',
      link: 'https://maps.app.goo.gl/FkDZGraEdQBmzS1A6',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'gyros',
      title: '📍 Gyros & Souvlaki',
      img: '/assets/images/giros.jpg',
      description: 'Taste the best gyros and souvlaki in Greece, a must-try for food lovers.',
      link: 'https://maps.app.goo.gl/yVgdoS9nzp6XErWR6',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'fish-tavernas',
      title: '📍 Fish Tavernas with Scenic Views',
      img: '/assets/images/eat.png',
      description: 'Enjoy fresh seafood with stunning views at the best fish tavernas.',
      link: 'https://maps.app.goo.gl/nvnD7kbMVK4dsJc96',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'desserts',
      title: '📍 Desserts',
      img: '/assets/images/desserts.jpg',
      description: 'Indulge in the sweetest desserts and treats that Greece has to offer.',
      link: 'https://maps.app.goo.gl/WKwvzVVLfCLLAAGK8',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'coffee',
      title: '📍 Coffee & Brunch',
      img: '/assets/images/coffee.jpg',
      description: 'Relax with a cup of coffee or enjoy a hearty brunch at cozy spots across Greece.',
      link: 'https://maps.app.goo.gl/p4o7Sk17ocYqQidP8',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'tavernas',
      title: '📍 Greek Restaurants',
      img: '/assets/images/taverna.jpg',
      description: 'Experience authentic Greek cuisine at traditional tavernas, a true culinary delight.',
      link: 'https://maps.app.goo.gl/b1bUHEkRYgv9dGGs7',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'wineries',
      title: '📍 Wineries',
      img: '/assets/images/winery.png',
      description: 'Find amazing vineyards and indulge in the finest Greek wines.',
      link: 'https://maps.app.goo.gl/izXJ2jaSSueHwrML8',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'burger',
      title: '📍 Burger Spots',
      img: '/assets/images/burger.jpg',
      description: 'Find the juiciest burgers and best burger joints in town for a satisfying meal.',
      link: 'https://maps.app.goo.gl/nYnmFKXgLBNkVKiC6',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'italian',
      title: '📍 Italian Cuisine',
      img: '/assets/images/italian.jpg',
      description: 'Savor the best Italian food in Greece, from pasta to pizza and more.',
      link: 'https://maps.app.goo.gl/KxdyM7pcpi8dSkTK7',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'asian',
      title: '📍 Asian Cuisine',
      img: '/assets/images/asian.webp',
      description: 'Discover the best Asian restaurants in Greece, offering authentic flavors and dishes.',
      link: 'https://maps.app.goo.gl/tn7c3qc8uYzbkhji6',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'mexican',
      title: '📍 Mexican Cuisine',
      img: '/assets/images/mexican.jpg',
      description: 'Savor the vibrant and bold flavors of Mexican cuisine in Greece.',
      link: 'https://maps.app.goo.gl/5aiGTrhtr7ob9D7M7',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'cheap-eats',
      title: '📍 Cheap Eats',
      img: '/assets/images/cheapEats.webp',
      description: 'Enjoy delicious meals that won’t break the bank, perfect for budget travelers.',
      link: 'https://maps.app.goo.gl/yB9f6U24aQbe8FNRA',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'bars',
      title: '📍 Bars & Drinks',
      img: '/assets/images/drinks.webp',
      description: 'Explore top bars and lounges for a vibrant nightlife experience.',
      link: 'https://maps.app.goo.gl/GzgU8nPbzbJE8K7P8',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'bougatsa',
      title: '📍 Bougatsa Shops',
      img: '/assets/images/bougatsa.jpg',
      description: 'Taste the famous Bougatsa pie, a traditional Greek pastry you’ll love.',
      link: 'https://maps.app.goo.gl/EdZ87NgMbE25Qk7f8',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'surf',
      title: '📍 Water Sports',
      img: '/assets/images/surf.jpg',
      description: 'Enjoy water sports and activities from surfing to paddle boarding.',
      link: 'https://maps.app.goo.gl/C9vQfGhZTVE5phpa6',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'family',
      title: '📍 Family Friendly',
      img: '/assets/images/family.jpg',
      description: 'Family-friendly spots for all ages, ensuring fun and memorable experiences.',
      link: 'https://maps.app.goo.gl/Ju4Aw5yUeQZLgK159',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'bouzoukia',
      title: '📍 Live Music (Bouzoukia)',
      img: '/assets/images/bouzoukia.jpg',
      description: 'Experience live Greek music and immerse yourself in the local culture.',
      link: 'https://maps.app.goo.gl/EockHSJsHcWGRk7j8',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      id: 'luxury',
      title: '📍 Luxury Dining',
      img: '/assets/images/fine-dining.jpg',
      description: 'Indulge in luxury dining experiences that redefine elegance and taste.',
      link: 'https://maps.app.goo.gl/peyCRuk3gVxiF2ej7',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  ];

  const [visibleOptions, setVisibleOptions] = useState(12); 

  const handleViewMore = () => {
    setVisibleOptions(mapOptions.length); 
  };

  return (
    <div className="container mx-auto px-4 py-8" id="maps">
      <h1 className="text-4xl font-primary font-bold text-[#001c28] mb-8 text-center">
      Ready-to-Use Google Maps Lists
      </h1>
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {mapOptions.slice(0, visibleOptions).map((option, index) => (
          <div
            key={index}
            id={option.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <img
              src={option.img}
              alt={`Image for ${option.title}`} // Added descriptive alt attribute
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold font-primary text-gray-800 mb-2 h-8 sm:h-14 overflow-hidden">
                {option.title}
              </h3>
                <p className="text-gray-600 font-secondary text-sm mb-2 sm:mb-4 h-12 sm:h-20 overflow-hidden line-clamp-3">
                {option.description} {/* Unique description for each map option */}
              </p>
                <a
                href={option.link}
                target="_self"
                rel={option.rel}
                className="inline-block mt-2 px-4 py-2 bg-[#0878fe] text-white font-semibold rounded shadow hover:bg-blue-700 transition duration-300 text-center"
                aria-label={`Explore ${option.title}`} 
                >
                Explore
                </a>
                <button
                onClick={() => {
                  const shareText = `Recommendations for ${option.title} in Greece from Googlementor`;
                  if (navigator.share) {
                  navigator.share({
                    title: option.title,
                    text: shareText,
                    url: option.link,
                  });
                  } else {
                  alert('Sharing is not supported on this browser.');
                  }
                }}
                className="inline-block mt-4 ml-2 px-4 py-2 bg-green-600 text-white font-semibold rounded shadow hover:bg-green-700 transition duration-300 text-center"
                aria-label={`Share ${option.title}`} 
                >
                Share
                </button>
            </div>
          </div>
        ))}
      </div>
      {/* Attribution Section */}
    <div className="mt-8 text-center font-secondary text-gray-500 text-sm">
      Images generated using Craiyon AI.
    </div>
    {visibleOptions < mapOptions.length && (
        <div className="mt-8 text-center">
          <button
            onClick={handleViewMore}
            className="px-6 py-3 bg-primary font-secondary text-white font-medium rounded-lg shadow-md hover:bg-secondary transition duration-300"
            aria-label="View more categories" // Added aria-label for the button
          >
            View More Categories
          </button>
        </div>
      )}
    </div>
  );
};

export default Product;