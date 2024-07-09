import React from 'react';

const ClaimBusinessPage = () => {
  return (
    <section className="py-6 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6">
          Google Business on Google Maps
        </h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          {/* Step 1 */}
          <div className="bg-white shadow-md rounded-lg p-6 w-full md:w-1/3">
            <h3 className="font-bold text-xl mb-4">
              Step 1:{' '}
              <a
                href="https://business.google.com/create?gmbsrc=ww-ww-z-gs-z-gmb-v-z-u~bhc-gmblp1-u&ppsrc=GMBB0&utm_campaign=ww-ww-z-gs-z-gmb-v-z-u~bhc-gmblp1-u&utm_source=gmb&utm_medium=z&skipLandingPage&service=ome&original_intent=GMB&omesrcexp=97643701&omec=ELXZxy4yAgECOipnbWJzcmM9d3ctd3ctei1ncy16LWdtYi12LXotdX5iaGMtZ21ibHAxLXVAAUoTCLn_hbrI4oYDFTqrAAAdWhEP6A%3D%3D"
                className="text-red-600 hover:text-red-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get a Business Profile
              </a>
            </h3>
            <p className="text-gray-600 mb-4">
              {/* Instruction text for step 1 */}
              The Google My Business app is no longer available, but you can now
              manage your business directly through Google Maps. To get started,
              you will need to create your Business Profile. Once set up, you
              can easily update your business information, respond to reviews,
              and engage with customers, all from within Google Maps.
            </p>
            {/* Placeholder for text input */}
            {/* TODO: Add text input for business name or email associated with Google My Business */}
          </div>

          {/* Step 2 */}
          <div className="bg-white shadow-md rounded-lg p-6 w-full md:w-1/3">
            <h3 className="font-bold text-xl mb-4">
              Step 2: Verify your business
            </h3>
            <p className="text-gray-600 mb-4">
              {/* Instruction text for step 2 */}
              Business owners or managers order a verification code sent to
              their business address, which arrives by postcard in about two
              weeks. They then use this code to verify their business. Google
              has updated its verification procedures to make the process easier
              and now there are additional verification methods available. For
              more information, please visit{' '}
              <a
                href="https://support.google.com/business/answer/7107242?sjid=809653980706618202-EU"
                className="text-red-600 hover:text-red-700 font-bold"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google&rsquo;s verification help page
              </a>
              .
            </p>
            {/* Placeholder for text input */}
            {/* TODO: Add text input for business search */}
          </div>

          {/* Step 3 */}
          <div className="bg-white shadow-md rounded-lg p-6 w-full md:w-1/3">
            <h3 className="font-bold text-xl mb-4">
              Step 3: Display your information
            </h3>
            <p className="text-gray-600 mb-4">
              {/* Instruction text for step 3 */}
              You can instantly improve the local ranking of your business.
              You&apos;ll need to fill in basic details such as your address,
              category, website, phone number, and opening hours. Adding photos
              and a detailed description of your business can make it more
              appealing to potential customers. Ensuring this information is
              current and accurate helps enhance your business&apos;s visibility
              and attractiveness on Google.
            </p>
            {/* Placeholder for text input */}
            {/* TODO: Add text input for verification code or method selection */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClaimBusinessPage;
