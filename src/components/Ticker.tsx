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
    <div className="overflow-hidden whitespace-nowrap bg-gray-100 py-2 border border-gray-300">
      <div className="flex animate-scroll">
        {tickerItems.concat(tickerItems).map((item, index) => {
          const [highlight, ...rest] = item.split(':'); // Split the string at the colon
          return (
            <div
              key={index}
              className="inline-block px-5 text-gray-800 font-medium text-sm"
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