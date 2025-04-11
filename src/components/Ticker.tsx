import React from 'react';

function MyTicker() {
  const tickerItems = [
    'Useful Apps: GREECE',
    'Order Food: efood - Wolt',
    'Ferry Tickets: Ferryhopper',
    'Health: doctoranytime',
    'Handyman: Douleutaras',
    'Shopping: Skroutz',
    'Taxi: FREENOW - Uber',
    'Car Rentals: Skyscanner',
    'Luggage Storage: Stasher',
    'Events: More',
    'e-Sim: Airalo',
    'Travel Insurance: SafetyWing',
    'Language: Google Translate',
    'Planning: rome2rio',
    'Tours: GetYourGuide',
  ];

  return (
    <div className="ticker-container z-50 fixed">
      <div className="flex animate-scroll space-x-5 min-w-max">
        {[...tickerItems].map((item, index) => {
          const [highlight, ...rest] = item.split(':'); // Split the string at the colon
          return (
            <div
              key={index}
              className="ticker-text inline-block whitespace-nowrap"
            >
              <span className="text-blue-600 font-bold">{highlight}:</span>{' '}
              <span>{rest.join(':')}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MyTicker;