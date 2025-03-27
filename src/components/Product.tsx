import React from 'react';

const Product = () => {
  const mapOptions = [
    {
      title: '📍 Vegan & Vegetarian Friendly ',
      img: '/assets/images/vegan.webp', // Replace with actual image path
      description: 'Find vegan & vegetarian friendly spots.',
      link: 'https://www.google.com/maps/@37.9884209,18.8656014,6z/data=!4m2!11m1!2sBlO52sink_AIFpF1zqhHJc4a-1gNjA?entry=ttu&g_ep=EgoyMDI1MDMyNC4wIKXMDSoJLDEwMjExNDUzSAFQAw%3D%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      title: '📍 Hiking Trails',
      img: '/assets/images/hiking.webp', // Replace with actual image path
      description: 'Explore the best hiking trails in Greece.',
      link: 'https://www.google.com/maps/@/data=!3m1!4b1!4m2!11m1!2s7OJgKvmRnVtoRn9oYU-nQBdtEa3YRg?g_ep=CAISEjI0LjQ3LjMuNjk4NTMxOTU1MBgAILffASqZASw5NDI0NDU0Myw5NDI0NjQ4MCw5NDI0MjUyOSw5NDIyNDgyNSw5NDIyNzI0Nyw5NDIyNzI0OCw5NDIzMTE4OCw0NzA3MTcwNCw5NDIwNjE2Niw0NzA2OTUwOCw5NDIxODY0MSw5NDIyODM1NCw5NDIzMzA3OSw5NDIwMzAxOSw0NzA4NDMwNCw5NDIwODQ1OCw5NDIwODQ0N0ICR1I%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      title: '📍 Desserts & Treats',
      img: '/assets/images/desserts.webp', // Replace with actual image path
      description: 'Indulge in the sweetest desserts and treats in Greece.',
      link: 'https://www.google.com/maps/@38.2359653,18.8043517,6z/data=!4m2!11m1!2sm1cxb5MV3-sY4PWJHfmInA21TWh0dw?entry=ttu&g_ep=EgoyMDI1MDMyNC4wIKXMDSoJLDEwMjExNDUzSAFQAw%3D%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      title: '📍 Family Friendly',
      img: '/assets/images/family.webp', // Replace with actual image path
      description: 'Family-friendly spots for all ages.',
      link: 'https://www.google.com/maps/@36.7677445,20.2183426,6.47z/data=!4m6!1m2!10m1!1e1!11m2!2s0EngS48iZOPCCddKa8VdXybOXjmbYQ!3e3?entry=ttu&g_ep=EgoyMDI1MDMyNC4wIKXMDSoJLDEwMjExNDUzSAFQAw%3D%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      title: '📍 Coffee & Brunch',
      img: '/assets/images/coffee.webp', // Replace with actual image path
      description: 'Relax with a cup of coffee or enjoy a hearty brunch.',
      link: 'https://www.google.com/maps/@/data=!3m1!4b1!4m2!11m1!2sbiCkX803OJgBPnpLky_vUk4mueLn2A?g_ep=CAISEjI0LjQ3LjMuNjk4NTMxOTU1MBgAILffASqZASw5NDI0NDU0Myw5NDI0NjQ4MCw5NDI0MjUyOSw5NDIyNDgyNSw5NDIyNzI0Nyw5NDIyNzI0OCw5NDIzMTE4OCw0NzA3MTcwNCw5NDIwNjE2Niw0NzA2OTUwOCw5NDIxODY0MSw5NDIyODM1NCw5NDIzMzA3OSw5NDIwMzAxOSw0NzA4NDMwNCw5NDIwODQ1OCw5NDIwODQ0N0ICR1I%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      title: '📍 Monasteries & Churches',
      img: '/assets/images/churches.webp', // Replace with actual image path
      description: 'Visit historic monasteries and beautiful churches.',
      link: 'https://www.google.com/maps/@/data=!3m1!4b1!4m2!11m1!2skRt2slouJJnCNj2AoZR08mpEYuOAbw?g_ep=CAISEjI0LjQ3LjMuNjk4NTMxOTU1MBgAILffASqZASw5NDI0NDU0Myw5NDI0NjQ4MCw5NDI0MjUyOSw5NDIyNDgyNSw5NDIyNzI0Nyw5NDIyNzI0OCw5NDIzMTE4OCw0NzA3MTcwNCw5NDIwNjE2Niw0NzA2OTUwOCw5NDIxODY0MSw5NDIyODM1NCw5NDIzMzA3OSw5NDIwMzAxOSw0NzA4NDMwNCw5NDIwODQ1OCw5NDIwODQ0N0ICR1I%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      title: '📍 Must-See Attractions',
      img: '/assets/images/must.webp', // Replace with actual image path
      description: 'Discover the must-see attractions in Greece.',
      link: 'https://www.google.com/maps/@/data=!3m1!4b1!4m2!11m1!2sYdxYS6H03eNUO6wBrMYZto99JAg9Ng?g_ep=CAISEjI0LjQ5LjMuNzAyODc2MTUxMBgAILffASqZASw5NDI0NDU0Myw5NDI0NjQ4MCw5NDI0MjUyOSw5NDIyNDgyNSw5NDIyNzI0Nyw5NDIyNzI0OCw5NDIzMTE4OCw0NzA3MTcwNCw5NDIwNjE2Niw0NzA2OTUwOCw5NDIxODY0MSw5NDIyODM1NCw5NDIzMzA3OSw5NDIwMzAxOSw0NzA4NDMwNCw5NDIwODQ1OCw5NDIwODQ0N0ICR1I%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      title: '📍 Rooftop Lounges',
      img: '/assets/images/rooftop.webp', // Replace with actual image path
      description: 'Relax and enjoy the view at the best rooftop lounges.',
      link: 'https://www.google.com/maps/@/data=!3m1!4b1!4m2!11m1!2sm3-v6U64Q2U33zHbEqNR5QCnmoCFwQ?g_ep=CAISEjI0LjQ3LjMuNjk4NTMxOTU1MBgAILffASqZASw5NDI0NDU0Myw5NDI0NjQ4MCw5NDI0MjUyOSw5NDIyNDgyNSw5NDIyNzI0Nyw5NDIyNzI0OCw5NDIzMTE4OCw0NzA3MTcwNCw5NDIwNjE2Niw0NzA2OTUwOCw5NDIxODY0MSw5NDIyODM1NCw5NDIzMzA3OSw5NDIwMzAxOSw0NzA4NDMwNCw5NDIwODQ1OCw5NDIwODQ0N0ICR1I%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      title: '📍 Tavernas',
      img: '/assets/images/taverna.webp', // Replace with actual image path
      description: 'Experience authentic Greek cuisine at traditional tavernas.',
      link: 'https://www.google.com/maps/@38.2213603,18.7977243,6z/data=!4m2!11m1!2sKWzjU1re09T9AWBKitVLba5WjIvAOA?entry=ttu&g_ep=EgoyMDI1MDMyNC4wIKXMDSoJLDEwMjExNDUzSAFQAw%3D%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      title: '📍 Wineries & Vineyards',
      img: '/assets/images/wine.webp', // Replace with actual image path
      description: 'Find amazing vineyards and indulge in Greek wines.',
      link: 'https://www.google.com/maps/@/data=!3m1!4b1!4m2!11m1!2sULXdtW62DdUhw9WNva4lJXSKQZNn1g?g_ep=CAISEjI0LjQ3LjMuNjk4NTMxOTU1MBgAILffASqZASw5NDI0NDU0Myw5NDI0NjQ4MCw5NDI0MjUyOSw5NDIyNDgyNSw5NDIyNzI0Nyw5NDIyNzI0OCw5NDIzMTE4OCw0NzA3MTcwNCw5NDIwNjE2Niw0NzA2OTUwOCw5NDIxODY0MSw5NDIyODM1NCw5NDIzMzA3OSw5NDIwMzAxOSw0NzA4NDMwNCw5NDIwODQ1OCw5NDIwODQ0N0ICR1I%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      title: '📍 Fish Tavernas',
      img: '/assets/images/fish.webp', // Replace with actual image path
      description: 'Enjoy fresh seafood.',
      link: 'https://www.google.com/maps/@/data=!3m1!4b1!4m2!11m1!2spbVj7n-ymuhsCoobIGpuZ7J1VyzStw?g_ep=CAISEjI0LjQ3LjMuNjk4NTMxOTU1MBgAILffASqZASw5NDI0NDU0Myw5NDI0NjQ4MCw5NDI0MjUyOSw5NDIyNDgyNSw5NDIyNzI0Nyw5NDIyNzI0OCw5NDIzMTE4OCw0NzA3MTcwNCw5NDIwNjE2Niw0NzA2OTUwOCw5NDIxODY0MSw5NDIyODM1NCw5NDIzMzA3OSw5NDIwMzAxOSw0NzA4NDMwNCw5NDIwODQ1OCw5NDIwODQ0N0ICR1I%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      title: '📍 Gyros & Souvlaki',
      img: '/assets/images/gyros.webp', // Replace with actual image path
      description: 'Taste the best gyros and souvlaki in Greece.',
      link: 'https://www.google.com/maps/@38.254912,18.8000805,6z/data=!4m2!11m1!2sLJ2pu96yJpCM1iWznQvGGNSrHClf_A?entry=ttu&g_ep=EgoyMDI1MDMyNC4wIKXMDSoJLDEwMjExNDUzSAFQAw%3D%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      title: '📍 Italian Cuisine',
      img: '/assets/images/italian.webp', // Replace with actual image path
      description: 'The best Italian food in Greece.',
      link: 'https://www.google.com/maps/@/data=!3m1!4b1!4m2!11m1!2s0-iIf-yL8Ia6FRPNS5lr6KoN0ovNJw?g_ep=CAISEjI0LjQ3LjMuNjk4NTMxOTU1MBgAILffASqZASw5NDI0NDU0Myw5NDI0NjQ4MCw5NDI0MjUyOSw5NDIyNDgyNSw5NDIyNzI0Nyw5NDIyNzI0OCw5NDIzMTE4OCw0NzA3MTcwNCw5NDIwNjE2Niw0NzA2OTUwOCw5NDIxODY0MSw5NDIyODM1NCw5NDIzMzA3OSw5NDIwMzAxOSw0NzA4NDMwNCw5NDIwODQ1OCw5NDIwODQ0N0ICR1I%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      title: '📍 Asian Cuisine',
      img: '/assets/images/asian.webp', // Replace with actual image path
      description: 'Discover the best Asian restaurants in Greece.',
      link: 'https://www.google.com/maps/@39.0538349,21.4979292,7z/data=!4m2!11m1!2sQPC_1O59iYgr3_lKUMmf_UPbQ3SsFg?entry=ttu&g_ep=EgoyMDI1MDMyNC4wIKXMDSoJLDEwMjExNDUzSAFQAw%3D%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      title: '📍 Bars & Drinks',
      img: '/assets/images/drinks.webp', // Replace with actual image path
      description: 'Explore the top bars and lounges.',
      link: 'https://www.google.com/maps/@40.691437,6.9973243,5z/data=!4m2!11m1!2sl42F2SIYqB3xNDLPLLuWuNii-mPoJg?entry=ttu&g_ep=EgoyMDI1MDMyNC4wIKXMDSoJLDEwMjExNDUzSAFQAw%3D%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      title: '📍 Burger Spots',
      img: '/assets/images/burger.webp', // Replace with actual image path
      description: 'Find the juiciest burgers and best burger joints in town.',
      link: 'https://www.google.com/maps/@/data=!3m1!4b1!4m2!11m1!2s3BJ_ogc9dsqNs-Rcp1eDsZlG6VqSvw?g_ep=CAISEjI0LjQ3LjMuNjk4NTMxOTU1MBgAILffASqHASw5NDI0NDU0Myw5NDI0MjUyOSw5NDIyNDgyNSw5NDIyNzI0Nyw5NDIyNzI0OCw5NDIzMTE4OCw0NzA3MTcwNCw5NDIwNjE2Niw0NzA2OTUwOCw5NDIxODY0MSw5NDIzMzA3OSw5NDIwMzAxOSw0NzA4NDMwNCw5NDIwODQ1OCw5NDIwODQ0N0ICR1I%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      title: '📍 Cheap Eats',
      img: '/assets/images/cheapEats.webp', // Replace with actual image path
      description: 'Enjoy delicious meals that won’t break the bank.',
      link: 'https://www.google.com/maps/@38.3220051,18.7985391,6z/data=!4m2!11m1!2sBzD8rczyvpOMIcGrMWy64UPTjh3Y2g?entry=ttu&g_ep=EgoyMDI1MDMyNC4wIKXMDSoJLDEwMjExNDUzSAFQAw%3D%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      title: '📍 Bougatsa Shops',
      img: '/assets/images/bougatsa.webp', // Replace with actual image path
      description: 'Taste the famous Bougatsa pie in Greece.',
      link: 'https://www.google.com/maps/@/data=!3m1!4b1!4m2!11m1!2s0Wwmu7OQWv8HDFmc_lRAYV5NvCG3XA?g_ep=CAISEjI0LjQ3LjMuNjk4NTMxOTU1MBgAILffASqZASw5NDI0NDU0Myw5NDI0NjQ4MCw5NDI0MjUyOSw5NDIyNDgyNSw5NDIyNzI0Nyw5NDIyNzI0OCw5NDIzMTE4OCw0NzA3MTcwNCw5NDIwNjE2Niw0NzA2OTUwOCw5NDIxODY0MSw5NDIyODM1NCw5NDIzMzA3OSw5NDIwMzAxOSw0NzA4NDMwNCw5NDIwODQ1OCw5NDIwODQ0N0ICR1I%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      title: '📍 Mexican Cuisine',
      img: '/assets/images/mexican.webp', // Replace with actual image path
      description: 'Savor the vibrant flavors of Mexican cuisine.',
      link: 'https://www.google.com/maps/@/data=!3m1!4b1!4m2!11m1!2sWY_q_zSFm5nxUUuGAVh-AifDfWNpHg?g_ep=CAISEjI0LjQ3LjMuNjk4NTMxOTU1MBgAILffASqZASw5NDI0NDU0Myw5NDI0NjQ4MCw5NDI0MjUyOSw5NDIyNDgyNSw5NDIyNzI0Nyw5NDIyNzI0OCw5NDIzMTE4OCw0NzA3MTcwNCw5NDIwNjE2Niw0NzA2OTUwOCw5NDIxODY0MSw5NDIyODM1NCw5NDIzMzA3OSw5NDIwMzAxOSw0NzA4NDMwNCw5NDIwODQ1OCw5NDIwODQ0N0ICR1I%3D',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8" id="maps">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        Explore Our Map Categories
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {mapOptions.map((option, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <img
              src={option.img} // Unique image for each map option
              alt={option.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {option.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {option.description} {/* Unique description for each map option */}
              </p>
              <a
                href={option.link}
                target={option.target}
                rel={option.rel}
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded shadow hover:bg-blue-700 transition duration-300 text-center"
              >
                Explore
              </a>
            </div>
          </div>
        ))}
      </div>
      {/* Attribution Section */}
    <div className="mt-8 text-center text-gray-500 text-sm">
      Images generated using Craiyon AI.
    </div>
    </div>
  );
};

export default Product;