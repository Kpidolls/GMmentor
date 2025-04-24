import React, { useState } from 'react';

const products = [
  {
    id: 'universal-travel-adapter',
    name: 'Universal Travel Adapter',
    description: 'All-in-one travel adapter. Perfect for charging your devices in over 150 countries worldwide.',
    image: '/assets/images/adapter.jpg',
    link: 'https://www.amazon.com/NEWVANGA-International-Universal-Worldwide-Charging/dp/B01FO4W5W2?crid=28IMN2VY22YN7&dib=eyJ2IjoiMSJ9.jJ5JSSoMLRaR3Hs-XHxku86MnNJRH365FkZhxTtWXCPN0QQ8pPQBQcprISWu5Z-Q9nMnoGUUKb4YF1CIGf526FDBhfd5D5xuQKMU1LKdkDTJXilM7I3tSQGSqAP1MefzATfITwcsgaSXquY_6XRJXXxLTOFW0Exl3H8Fj3fituy7nCYIFNEFOrhvD3Ewu7zf84FJDvjlN6DSqJy2j4h-B-SKAXUd-l7ZYKXAor1AyVjM8jOBjJfm-KgVrPgD77hadOIAwWnviwR8jXNtsYpcP-7_Ldbw9KuCKDJBSfBt5T8.7LnubVDXoBTeUbNW964t3QmLTk7hwMnbsGHMCyLXj1s&dib_tag=se&keywords=Universal%2BTravel%2BAdapter&qid=1743661696&sprefix=universal%2Btravel%2Badapter%2Caps%2C281&sr=8-6&th=1&linkCode=ll1&tag=googlementor-20&linkId=138bf86aa348318d5c924b0c3a956757&language=en_US&ref_=as_li_ss_tl',
  },
  {
    id: 'mobile-data-esim-card',
    name: 'Mobile Data e-SIM Card',
    description: 'Stay online effortlessly while traveling with this e-SIM card. Get 3€ off your first purchase with code GOOGLE4204.',
    image: '/assets/images/airalo.webp',
    link: 'https://www.airalo.com/',
  },
  {
    id: 'pillow-mask',
    name: 'Pillow and Mask',
    description: 'Travel in comfort with this ergonomic pillow and sleep mask set. Perfect for long flights or road trips.',
    image: '/assets/images/pillow.jpg',
    link: 'https://www.amazon.com/SARISUN-Airplanes-Sleeping-Headrest-Eligible/dp/B0CL6CXMGZ?crid=1XOTYYXQ7J8S8&dib=eyJ2IjoiMSJ9.DyT2qP-xZMOu-DEanapYVB_zQbxYLigcZeeHLK6NuIBr3R83NYGO31bTUfTWblVIhsEc-ozpY9JE5JpYi2vd7UegxZrqtCtm3-W52ZaFWSM7EhzteyGWKaJZ4SG4bgwyXagt2ufXcOMbDeXJ5rZsdEFEqJ6lqKfeJFIfp_aBB-fxHEjzXfkij_kMRn_-GSHqgFhBmZ91SgaiiIGaIlBAqRVjl6h7hBTqrsx7l9uDDddk_62NXVPT7S2emk1waxk_tbKHagXArlBs6lrQHFcVFYzgLQNdJTBx3FgnHuCWIyE.Uw6YzlSws72o1UJHLP2dCvlBxZEtPqGBuMhPhYu36sc&dib_tag=se&keywords=pillow%2Btravel%2Band%2Bmask&qid=1744964506&sprefix=pillow%2Btravel%2Band%2Bmask%2Caps%2C231&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1&linkCode=ll1&tag=googlementor-20&linkId=1e7392ea42e93d97ceb967d7e460881a&language=en_US&ref_=as_li_ss_tl',
  },
  {
    id: 'travel-luggage-lock',
    name: 'Luggage Lock',
    description: 'Keep your belongings safe with this TSA-approved luggage lock. Durable and easy to use for peace of mind during your travels.',
    image: '/assets/images/lock.jpg',
    link: 'https://www.amazon.com/Compatible-Travel-Luggage-Inspection-Indicator/dp/B073NYB7R2?crid=193YCY2P4WJR4&dib=eyJ2IjoiMSJ9.gk-FsnfAsrB47YFDiXxMZr4w4lgP23Tqz7Vz1m0VIcIxhhB-qf4rTBPMshxuzn7eDjVo_EIy3oMMztzefkXVcD3pVcQ0OaDKEfgkMV2Y2VGhefOSPIAbVkKbfWsME9aeoEyyy75OIfkRM9eLL0ZWDX91_Hh9w1JThAmanWbAm--GLXHNedqncyDGtAWuxKVtiThk8abcr0ug6lAaRvS6izTTVGJ9i_OmPDPrrQqpWrJl5nyx_nchT9ee-T7oQ6Gydgt1tRQbNPk-GG5GV4Dve8AFucT9FM1Y861m9O5bwiY.HT4ld4jRTAzqdjzrYDoHvJYfvcaDV3k41C2nKKJRe38&dib_tag=se&keywords=luggage%2Block&qid=1744297813&sprefix=luggage%2Block%2Caps%2C266&sr=8-2&th=1&linkCode=ll1&tag=googlementor-20&linkId=f60ff431657ac0a3dc911b8b1c082318&language=en_US&ref_=as_li_ss_tl',
  },
  {
    id: 'dry-bag-waterproof',
    name: 'Waterproof Bag',
    description: 'Protect your belongings from water damage with this lightweight, durable dry bag. Ideal for beach trips, kayaking, and more.',
    image: '/assets/images/waterbag.jpg',
    link: 'https://www.amazon.com/HEETA-Waterproof-Lightweight-Backpack-Transparent/dp/B07PLZP5LN?crid=2S45C5LWP7B8C&dib=eyJ2IjoiMSJ9.04dV5-nTjb_XJlbT6NyZUC1h2Y_hDzZ4TBvQ94SqYoyL9VQq6uvOv7aI3Cv_Is5nIYXzmexSi81ePUFvNJVLle-9SBw7eUuwB1AwFLAPsJpFvmMvnFp7lK0D_vKXGnbcreI2HtG24XF6uiPk8RMF19oEO4tg6sp1IdVwz9OnLEbqpeknRxSRoTeYryP3_KCOY3mtDI_57KTwH-aG-cQQxuc0uJtPph2PnZn88Mv_BX8geryUVVvuuTngrxZa3_HsNljlHeanHyv7ewlC2meSHD7hSi9izeXdgo6JwQeKMQQ.s5-nBJejLDvzZsHHOKyTbXF5NCMwpWSzUDZddxyVn-8&dib_tag=se&keywords=dry%2Bbag%2Bwaterproof&qid=1744282796&sprefix=dry%2Bbag%2B%2Caps%2C264&sr=8-2&th=1&linkCode=ll1&tag=googlementor-20&linkId=53007ac01d6feb4e5350f5827f915ec2&language=en_US&ref_=as_li_ss_tl',
  },
  {
    id: 'portable-charger-20000mah',
    name: 'Portable Charger 20000mAh',
    description: 'Keep your devices powered up with this high-capacity portable charger. Perfect for long trips and multiple devices.',
    image: '/assets/images/charger.jpg',
    link: 'https://www.amazon.com/INIU-Portable-20000mAh-High-speed-Flashlight/dp/B07YPY31FL?crid=1XSBI2DD4MBI3&dib=eyJ2IjoiMSJ9.CZlI-b10iXOHhb1rmCebQ5pDKUotPusAaFPEu8XSDTm7KcdiWrT22WwyVSuZUn6drRlqXZBNAHJ7e4LZeolR-w-HP61bxkUMIZgDjk_BQobAX4j6bxfaMHAXp73aGxXF9SZ8E-GR4jRJzSSyzpX3VWP-NmzVisQUQMi-RzV1e2NpXrXqrAg2AJ5ic0GKH1WNIc6IOouEI3vin2Ki-t6Qeh_46j39WTIAElT7G95fZTw.Xkng_Yvwx6COR4I8_1KOB2ycYa7ik4Nw_BKMcom8aPY&dib_tag=se&keywords=power%2Bbank&qid=1744281640&sprefix=powerbank%2Caps%2C267&sr=8-3&th=1&linkCode=ll1&tag=googlementor-20&linkId=15bde893fcb2936e8586db2e6dc66509&language=en_US&ref_=as_li_ss_tl',
  },{
    id: 'car-charger',
    name: 'Car Charger',
    description: 'Charge your devices on the go with this compact and efficient car charger. Perfect for road trips and daily commutes.',
    image: '/assets/images/car-charger.jpg',
    link: 'https://www.amazon.com/LISEN-Retractable-Charger-Charging-Accessories/dp/B0D4215HCX',
  },
  {
    id: 'sun-protection-shirt',
    name: 'Sun Protection Shirt',
    description: 'Stay cool and shielded from harmful UV rays with this lightweight and breathable sun protection shirt. Ideal for outdoor adventures.',
    image: '/assets/images/swimshirt.jpg',
    link: 'https://www.amazon.com/Roadbox-Protection-Outdoor-Rashguard-Campanula/dp/B08BFKM7VT',
  },
  {
    id: 'water-shoes',
    name: 'Water Shoes',
    description: 'Enjoy comfort and safety during water activities with these quick-dry, anti-slip water shoes. Perfect for beaches, rivers, and pools.',
    image: '/assets/images/watershoes.jpg',
    link: 'https://www.amazon.com/ATHMILE-Quick-Dry-Barefoot-Exercise-Accessories/dp/B09Q3MYDQH',
  },
  {
    id: 'waterproof-phone-case',
    name: 'Waterproof Phone Case',
    description: 'Keep your phone safe and dry with this durable waterproof case. Perfect for beach days, kayaking, and other water activities.',
    image: '/assets/images/phonecase.jpg',
    link: 'https://www.amazon.com/Lamicall-Waterproof-Phone-Pouch-Case/dp/B0BQRDKRL6',
  },
  {
    id: 'mini-bluetooth-speaker',
    name: 'Mini Bluetooth Speaker',
    description: 'Take your music anywhere with this portable, waterproof Bluetooth speaker. Enjoy high-quality sound on the go.',
    image: '/assets/images/jbl.jpg',
    link: 'https://www.amazon.com/JBL-Bluetooth-Built-Waterproof-Dustproof/dp/B08KW1KR5H',
  },
  {
    id: 'phone-holder-mount',
    name: 'Phone Holder Mount',
    description: 'Make hands-free calls and navigate effortlessly with this sturdy and adjustable phone holder mount for your car.',
    image: '/assets/images/mount.png',
    link: 'https://www.amazon.com/LISEN-Essentials-Accessories-Universal-Handsfree/dp/B0CKN1N2YH',
  },
  {
    id: 'airplane-phone-holder',
    name: 'Airplane Phone Holder',
    description: 'Enjoy hands-free entertainment on flights with this compact and adjustable airplane phone holder. Perfect for watching movies.',
    image: '/assets/images/mount-airplane.jpg',
    link: 'https://www.amazon.com/Perilogics-Universal-Airplane-Multi-Directional-Rotation/dp/B07T8KL6C6',
  },
  {
    id: 'sony-wireless-headphones',
    name: 'Sony Wireless Noise Canceling Headphones',
    description: 'Immerse yourself in crystal-clear sound with these premium noise-canceling headphones. Perfect for travel and relaxation.',
    image: '/assets/images/headphones.jpg',
    link: 'https://www.amazon.com/Sony-WH-1000XM5-Canceling-Headphones-Hands-Free/dp/B09XS7JWHH',
  },
  {
    id: 'nordic-walking-poles',
    name: 'Nordic Walking Poles',
    description: 'Enhance your hiking experience with these lightweight and durable Nordic walking poles. Perfect for all terrains.',
    image: '/assets/images/poles.png',
    link: 'https://www.amazon.com/TheFitLife-Nordic-Walking-Trekking-Poles/dp/B01N57G27J',
  },
  {
    id: 'anker-multi-usb-port',
    name: 'Anker Multi USB Port',
    description: 'Charge multiple devices simultaneously with this compact and reliable multi-USB port. Ideal for home or travel.',
    image: '/assets/images/usbports.jpg',
    link: 'https://www.amazon.com/Anker-Display-MacBook-Thinkpad-Laptops/dp/B0BQLLB61B',
  },
  {
    id: 'european-travel-plug',
    name: 'European Travel Plug',
    description: 'Stay powered up in Europe with this fast-charging travel plug featuring multiple USB ports for convenience.',
    image: '/assets/images/multiusb.jpg',
    link: 'https://www.amazon.com/USINFLY-European-Adapter-Charging-International/dp/B0CRYN8FGP',
  },
  {
    id: 'apple-airtag',
    name: 'Apple AirTag',
    description: 'Keep track of your belongings with this compact and reliable Apple AirTag. Never lose your essentials again.',
    image: '/assets/images/airtag.jpg',
    link: 'https://www.amazon.com/Apple-MX532LL-A-AirTag/dp/B0CWXNS552',
  },
  {
    id: 'mini-power-bank',
    name: 'Mini Power Bank',
    description: 'Stay charged on the go with this compact and lightweight mini power bank. Perfect for travel and emergencies.',
    image: '/assets/images/powerbank.jpg',
    link: 'https://www.amazon.com/INIU-Portable-Charging-10000mAh-Tablets/dp/B09176JCKZ',
  },
  {
    id: 'sun-hat',
    name: 'Sun Hat',
    description: 'Stay cool and stylish while protecting yourself from the sun with this lightweight and breathable sun hat.',
    image: '/assets/images/hat.jpg',
    link: 'https://www.amazon.com/Summer-Panama-Straw-Fedora-Beach/dp/B07BNNNSX5',
  },
  {
    id: 'tile-gps-tracker',
    name: 'Tile GPS Tracker',
    description: 'Never lose your valuables again with this compact and reliable Tile GPS tracker. Perfect for keys, bags, and more.',
    image: '/assets/images/tile.jpg',
    link: 'https://www.amazon.com/Tile-Life360-Bluetooth-Tracker-Compatible/dp/B0D63657GY',
  },
  {
    id: 'water-bottle',
    name: 'Water Bottle with Handle and Straw',
    description: 'Stay hydrated on the go with this durable and portable water bottle featuring a convenient handle and straw.',
    image: '/assets/images/water.jpg',
    link: 'https://www.amazon.com/Simple-Modern-Tumbler-Handle-Insulated/dp/B0BHBP1X1B',
  },
  {
    id: 'herschel-backpack',
    name: 'Herschel Travel Backpack',
    description: 'Carry your essentials in style with this spacious and durable Herschel travel backpack. Perfect for any adventure.',
    image: '/assets/images/backpack.jpg',
    link: 'https://www.amazon.com/Herschel-Supply-Co-Classic-Backpack/dp/B0C3B2B5QC',
  },
  {
    id: 'face-sunscreen',
    name: 'Face Sunscreen SPF 46',
    description: 'Protect your skin from harmful UV rays with this lightweight and dermatologist-recommended face sunscreen.',
    image: '/assets/images/sunscreen.jpg',
    link: 'https://www.amazon.com/EltaMD-Acne-Prone-Mineral-Based-Dermatologist-Recommended/dp/B002MSN3QQ',
  },
  {
    id: 'travel-first-aid-kit',
    name: 'Travel First Aid Kit',
    description: 'Be prepared for any situation with this compact and comprehensive travel first aid kit. A must-have for every trip.',
    image: '/assets/images/firstaid.jpg',
    link: 'https://www.amazon.com/Mini-First-Aid-Pieces-Small/dp/B0747N5KDM',
  },
  {
    id: 'beach-blanket',
    name: 'Beach Blanket',
    description: 'Relax in comfort with this lightweight and sand-resistant beach blanket. Perfect for picnics, beaches, and outdoor fun.',
    image: '/assets/images/blanket.jpg',
    link: 'https://www.amazon.com/Wekapo-Blanket-Compact-Lightweight-Durable/dp/B08X6VQBGJ',
  },
];

const Store: React.FC = () => {
  const [visibleProducts, setVisibleProducts] = useState(8);
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: string]: boolean }>({});

  const handleViewMore = () => {
    setVisibleProducts((prev) => prev + 8);
  };

  const toggleDescription = (id: string) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div id="store" className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h2 className="text-3xl font-extrabold font-secondary-primary text-gray-900 sm:text-4xl text-center">
          Shop Travel-Themed Gifts
        </h2>
        <p className="mt-4 text-lg text-gray-600 font-secondary text-center">
          Discover the perfect travel accessories for your next adventure.
        </p>

        {/* Product Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.slice(0, visibleProducts).map((product) => (
            <div
              key={product.id}
              className="bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              {/* Product Image */}
              <a
                href={product.link}
                target="_self"
                rel="noopener noreferrer"
                aria-label={`Learn more about ${product.name}`}
                className="block"
              >
                <img
                  src={product.image}
                  alt={`Image of ${product.name}`}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </a>

              {/* Product Details */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold font-primary text-gray-800 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 font-secondary text-sm mb-4">
                  {expandedDescriptions[product.id]
                    ? product.description
                    : product.description.length > 150
                    ? `${product.description.slice(0, 150)}...`
                    : product.description}
                  {product.description.length > 150 && !expandedDescriptions[product.id] && (
                    <button
                      onClick={() => toggleDescription(product.id)}
                      className="text-primary font-medium hover:underline ml-1"
                      aria-label={`Show full description for ${product.name}`}
                    >
                      Read More
                    </button>
                  )}
                  {expandedDescriptions[product.id] && (
                    <button
                      onClick={() => toggleDescription(product.id)}
                      className="text-primary font-medium hover:underline ml-1"
                      aria-label={`Collapse description for ${product.name}`}
                    >
                      Show Less
                    </button>
                  )}
                </p>
                <a
                  href={product.link}
                  target="_self"
                  rel="noopener noreferrer"
                  className="mt-auto inline-block text-primary font-medium hover:underline"
                  aria-label={`Learn more about ${product.name}`}
                >
                  Learn More
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        {visibleProducts < products.length && (
          <div className="mt-8 text-center">
            <button
              onClick={handleViewMore}
              className="px-6 py-3 bg-primary text-white font-secondary font-medium rounded-lg shadow-md hover:bg-secondary transition duration-300"
              aria-label="View more products"
            >
              View More Products
            </button>
          </div>
        )}

        {/* Footer Note */}
        <p className="mt-8 text-sm text-gray-500 font-secondary text-center">
          Note: We may earn a commission if you purchase through these links.
        </p>
      </div>
    </div>
  );
};

export default Store;