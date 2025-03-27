// import React, { useState } from 'react';
// import config from '../config/index.json';

// /**
//  * This component displays product information and allows users to select a map category and request a list via email.
//  * It includes a form with a dropdown for selecting map categories and a button to send the request.
//  * The country is pre-selected as "Greece" and cannot be changed.
//  * 
//  * @todo Replace this with mail list functionality and add a checkbox for user agreement.
//  */
// const Product = () => {
//   const { product } = config;
//   const [firstItem, secondItem] = product.items || [{}, {}];

//   const [selectedOption, setSelectedOption] = useState('');

//   const handleCopy = () => {
//     const textToCopy = `${selectedOption} - Greece https://googlementor.com`;
//     navigator.clipboard.writeText(textToCopy);
//   };

//   const mapOptions = [
//     '📍 Asian Cuisine',
//     '📍 Bars & Drinks',
//     '📍 Burger Spots',
//     '📍 Cheap Eats',
//     '📍 Coffee & Brunch',
//     '📍 Desserts & Treats',
//     '📍 Fish Tavernas',
//     '📍 Fish Tavernas with Scenic Views',
//     '📍 Gyros & Souvlaki',
//     '📍 Hiking Trails',
//     '📍 Italian Cuisine',
//     '📍 Luxury Dining',
//     '📍 Mexican Cuisine',
//     '📍 Monasteries & Churches',
//     '📍 Must-See Attractions',
//     '📍 Rooftop Lounges',
//     '📍 Tavernas',
//     '📍 Vegan & Vegetarian friendly',
//     '📍 Wineries & Vineyards'
//   ];

//   return (
//     <div className="container mx-auto px-4 py-8" id="maps">
//       <div className="flex flex-wrap items-center mb-12">
//         <div className="w-full md:w-1/2 p-6">
//           <h3 className="text-4xl text-gray-800 font-bold leading-tight mb-4">
//             {product.title}
//           </h3>
//             <p className="text-gray-600 text-lg mb-6 leading-relaxed text-justify">
//             {firstItem?.description}
//             </p>
//           {/* <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow hover:bg-blue-700 transition duration-300">
//             Learn More
//           </button> */}
//                 <div className="mt-10">
//         <h2 className="text-2xl font-bold mb-4">Request a Free Map List</h2>
//         <p className="mb-4">Select a list you want and send us an email with your request.</p>
//         <label htmlFor="map-category" className="block mb-2 text-sm font-medium text-gray-700">
//           Select a map category
//         </label>
//         <select
//           id="map-category"
//           value={selectedOption}
//           onChange={(e) => setSelectedOption(e.target.value)}
//           className="mb-4 p-2 border rounded w-full md:w-auto"
//         >
//           <option value="" disabled>Select a map category</option>
//           {mapOptions.map((option, index) => (
//             <option key={index} value={option}>
//               {option}
//             </option>
//           ))}
//         </select>
//         <button
//           type="button"
//           onClick={() => {
//             handleCopy();
//             const encodedOption = encodeURIComponent(selectedOption);
//             window.location.href = `mailto:mapsmentorinfo@gmail.com?subject=I agree with googlementor.com terms!&body=I would like the "${encodedOption} in Greece" list`;
//           }}
//           className={`mt-4 md:mt-0 ml-0 md:ml-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition-colors duration-300 w-full md:w-auto ${!selectedOption ? 'opacity-50 cursor-not-allowed' : ''}`}
//           disabled={!selectedOption}
//         >
//           Request
//         </button>
//       <button
//         type="button"
//         onClick={handleCopy}
//         className={`mt-4 md:mt-0 ml-0 md:ml-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors duration-300 w-full md:w-auto ${!selectedOption ? 'opacity-50 cursor-not-allowed' : ''}`}
//         disabled={!selectedOption}
//       >
//         Copy
//       </button>
//       <div className="mt-6">
//         <label htmlFor="country" className="block mb-2 text-sm font-medium text-gray-700">
//           Country
//         </label>
//         <select
//           id="country"
//           value="Greece"
//           disabled
//           className="mb-4 p-2 border rounded w-full md:w-auto bg-gray-200 cursor-not-allowed"
//         >
//           <option value="Greece">Greece</option>
//         </select>
//       </div>
//       </div>
//         <div className="mt-6">
//             <div className="bg-gray-100 border-l-4 border-gray-300 p-2 rounded-md shadow-md">
//               <p className="font-semibold text-gray-800 text-sm">Available Regions</p>
//               <p className="text-gray-700 text-sm">We currently offer custom maps for Greece</p>
//               {/* comment , with plans to expand to more regions and city-specific lists in the near future. Stay tuned for updates! */}
//             </div>
//         </div>
//         </div>
//         <div className="w-full md:w-1/2 p-6">
//           <img
//             className="w-full h-auto rounded-lg shadow-md"
//             src={firstItem?.img}
//             alt={firstItem?.title}
//           />
//         </div>
//       </div>
//       <div className="flex flex-wrap items-center">
//         <div className="w-full md:w-1/2 p-6 order-2 md:order-1">
//           <img
//             className="w-full h-auto rounded-lg shadow-md"
//             src={secondItem?.img}
//             alt={secondItem?.title}
//           />
//         </div>
//         <div className="w-full md:w-1/2 p-6 order-1 md:order-2">
//           <h3 className="text-4xl text-gray-800 font-bold leading-tight mb-4">
//             {secondItem?.title}
//           </h3>
//           <p className="text-gray-600 text-lg mb-6">{secondItem?.description}</p>
//           {/* <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow hover:bg-blue-700 transition duration-300">
//             Learn More
//           </button> */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Product;
import React from 'react';

const Product = () => {
  const mapOptions = [
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
      title: '📍 Coffee & Brunch',
      img: '/assets/images/coffee.webp', // Replace with actual image path
      description: 'Relax with a cup of coffee or enjoy a hearty brunch.',
      link: 'https://www.google.com/maps/@/data=!3m1!4b1!4m2!11m1!2sbiCkX803OJgBPnpLky_vUk4mueLn2A?g_ep=CAISEjI0LjQ3LjMuNjk4NTMxOTU1MBgAILffASqZASw5NDI0NDU0Myw5NDI0NjQ4MCw5NDI0MjUyOSw5NDIyNDgyNSw5NDIyNzI0Nyw5NDIyNzI0OCw5NDIzMTE4OCw0NzA3MTcwNCw5NDIwNjE2Niw0NzA2OTUwOCw5NDIxODY0MSw5NDIyODM1NCw5NDIzMzA3OSw5NDIwMzAxOSw0NzA4NDMwNCw5NDIwODQ1OCw5NDIwODQ0N0ICR1I%3D',
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
      title: '📍 Mexican Cuisine',
      img: '/assets/images/mexican.webp', // Replace with actual image path
      description: 'Savor the vibrant flavors of Mexican cuisine.',
      link: 'https://www.google.com/maps/@/data=!3m1!4b1!4m2!11m1!2sWY_q_zSFm5nxUUuGAVh-AifDfWNpHg?g_ep=CAISEjI0LjQ3LjMuNjk4NTMxOTU1MBgAILffASqZASw5NDI0NDU0Myw5NDI0NjQ4MCw5NDI0MjUyOSw5NDIyNDgyNSw5NDIyNzI0Nyw5NDIyNzI0OCw5NDIzMTE4OCw0NzA3MTcwNCw5NDIwNjE2Niw0NzA2OTUwOCw5NDIxODY0MSw5NDIyODM1NCw5NDIzMzA3OSw5NDIwMzAxOSw0NzA4NDMwNCw5NDIwODQ1OCw5NDIwODQ0N0ICR1I%3D',
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
    </div>
  );
};

export default Product;