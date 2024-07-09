import React from 'react';

const EsimProduct = () => {
  return (
    <section className="py-6 px-4 items-center" id="esimproduct">
      <div className="flex flex-wrap -mx-4 justify-center">
        <div className="md:w-1/2 px-4 mb-8 md:mb-0">
          <div className="h-full bg-white rounded-lg overflow-hidden">
            <div className="p-8">
              <h3 className="font-bold text-2xl mb-4 text-center">
                {/* Title goes here */} Support our mission!
              </h3>
              <p className="text-gray-600 mb-8">
                As a traveler, buying an eSIM offers numerous benefits, ensuring
                you have internet access from the moment your trip begins. With
                an eSIM, you can connect to the internet as soon as you land,
                without the hassle of finding a local SIM card. Stay connected
                with family and friends without interruptions, avoid expensive
                international roaming charges and the inconvenience of switching
                physical SIM cards. Use essential travel apps for your booked
                accommodation or rideshare, communicate with locals whenever
                needed and ensure prompt communication right from the start. We
                have partnered with the best in the industry to provide you with
                reliable mobile data in more than 200+ countries.
                <br />
                <br /> <strong>Disclosure</strong>: This is an affiliate link,
                and we may earn a commission if you make a purchase through our
                site. The prices remain the same for you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EsimProduct;
