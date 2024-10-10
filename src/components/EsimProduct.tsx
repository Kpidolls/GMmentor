import React from 'react';

const EsimProduct = () => {
  return (
    <section className="py-12 bg-gray-100" id="esimproduct">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-center md:space-x-8">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <div className="h-full bg-white rounded-lg overflow-hidden shadow-lg p-8">
              <h3 className="font-bold text-3xl mb-6 text-center text-indigo-600">
                Get Mobile Data for Travel: Buy an eSIM
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                As a traveler, buying an eSIM offers numerous benefits, ensuring
                you have internet access from the moment your trip begins. With
                an eSIM, you can connect to the internet as soon as you land,
                without the hassle of finding a local SIM card. Stay connected
                with family and friends without interruptions, avoid expensive
                international roaming charges and the inconvenience of switching
                SIM cards. Contact us via email for a discount!
              </p>
              <div className="text-center">
                <a
                  href="https://www.airalo.com/"
                  className="inline-block bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buy Now
                </a>
              </div>
            </div>
          </div>
          <div className="md:w-1/2">
            <img
              src="/assets/images/airalo.svg"
              alt="eSIM Product"
              className="rounded-lg shadow-lg w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default EsimProduct;