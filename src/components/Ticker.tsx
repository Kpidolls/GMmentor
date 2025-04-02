import React from 'react';

function MyTicker() {
  const tickerItems = [
    'Order Food: efood - Wolt',
    'Ferry Tickets: Ferryhopper',
    'Health: doctoranytime',
    'Handyman: Douleutaras',
    'Shopping: Skroutz',
    'Car Rentals: Skyscanner',
    'Events: more.com',
    'e-Sim: Airalo',
    'Travel Insurance: SafetyWing',
  ];

  return (
    <div className="ticker-container z-50 fixed">
      <div className="flex animate-scroll space-x-5 min-w-max">
        {/* Duplicate items for seamless scrolling */}
        {[...tickerItems, ...tickerItems].map((item, index) => {
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