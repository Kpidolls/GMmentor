import React from 'react';

function MyTicker() {
  const tickerItems = [
    'USEFUL APPS: GREECE',
    'Accommodation: Booking.com - Airbnb',
    'Order Food: efood - Wolt',
    'Ferry Tickets: Ferryhopper',
    'Health: doctoranytime',
    'Handyman: Douleutaras',
    'Shopping: Skroutz',
    'Taxi: FREENOW - Uber',
    'Car Rentals: Skyscanner',
    'Luggage Storage: Stasher',
    'Events: ticketmaster - More',
    'e-Sim: Airalo',
    'Travel Insurance: SafetyWing',
    'Language: Google Translate',
    'Planning: rome2rio',
    'Tours: GetYourGuide',
    'Parking: ParkAround',
    'Expense Tracker: Splitwise',
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
              <span className="text-[#0878fe] font-bold">{highlight}:</span>{' '}
              <span>{rest.join(':')}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MyTicker;