import React, { useState } from 'react';

const products = [
  {
    id: 'universal-travel-adapter',
    name: 'Universal Travel Adapter',
    description: 'Charge anywhere in the world.',
    image: '/assets/images/adapter.jpg',
    link: 'https://www.amazon.com/NEWVANGA-International-Universal-Worldwide-Charging/dp/B01FO4W5W2?crid=28IMN2VY22YN7&dib=eyJ2IjoiMSJ9.jJ5JSSoMLRaR3Hs-XHxku86MnNJRH365FkZhxTtWXCPN0QQ8pPQBQcprISWu5Z-Q9nMnoGUUKb4YF1CIGf526FDBhfd5D5xuQKMU1LKdkDTJXilM7I3tSQGSqAP1MefzATfITwcsgaSXquY_6XRJXXxLTOFW0Exl3H8Fj3fituy7nCYIFNEFOrhvD3Ewu7zf84FJDvjlN6DSqJy2j4h-B-SKAXUd-l7ZYKXAor1AyVjM8jOBjJfm-KgVrPgD77hadOIAwWnviwR8jXNtsYpcP-7_Ldbw9KuCKDJBSfBt5T8.7LnubVDXoBTeUbNW964t3QmLTk7hwMnbsGHMCyLXj1s&dib_tag=se&keywords=Universal%2BTravel%2BAdapter&qid=1743661696&sprefix=universal%2Btravel%2Badapter%2Caps%2C281&sr=8-6&th=1&linkCode=ll1&tag=googlementor-20&linkId=138bf86aa348318d5c924b0c3a956757&language=en_US&ref_=as_li_ss_tl',
  },
  {
    id: 'mobile-data-esim-card',
    name: 'Mobile Data e-SIM Card',
    description: 'Get 3€ off first purchase with code GOOGLE4204.',
    image: '/assets/images/airalo.webp',
    link: 'https://www.airalo.com/',
  },
  {
    id: 'waterproof-phone-case',
    name: 'Waterproof Phone Case',
    description: 'Protect your phone at the beach.',
    image: '/assets/images/phonecase.jpg',
    link: 'https://www.amazon.com/Lamicall-Waterproof-Phone-Pouch-Case/dp/B0BQRDKRL6?crid=OGV98TJ7YOCU&dib=eyJ2IjoiMSJ9.rvdGKthxZZQp1d8I-eHoxHlzPyaY547vZ48m43gd_FOYCT1rfHHa_pz_Vw8eWGjTBxn1PLfcsJmq_EYsJyRXH7hxJWFe_GziDMKS4FIBLAEcBy8XupPK_7ZL3Zmoz-o0xEgyNFcSzNLdmNxbXHZenzMHJY7xdUrx7HBtncDG6qRH4-Kq4HNnsPSlF-PerK2wYkLW4yoU3xLFlWE6TlKgLN_QpclCDYtSNXJLwwM9aks.oxyhtaoXkD1Y-wrxQR5lt5sKSdPBXqzDowSgHLhQjjA&dib_tag=se&keywords=waterproof%2Bphone%2Bcase&qid=1743662562&sprefix=waterproof%2Bphone%2B%2Caps%2C236&sr=8-1&th=1&linkCode=ll1&tag=googlementor-20&linkId=6304637682d9023a1e744f35066cf416&language=en_US&ref_=as_li_ss_tl',
  },
  {
    id: 'water-shoes',
    name: 'Water Shoes',
    description: 'Perfect for beach and water activities.',
    image: '/assets/images/watershoes.jpg',
    link: 'https://www.amazon.com/ATHMILE-Quick-Dry-Barefoot-Exercise-Accessories/dp/B09Q3MYDQH?crid=29GN13UM8DI65&dib=eyJ2IjoiMSJ9.NPjF_UkxH8HkjqvHP02DhqOsxKSBgQWtxxIVPvkvj_uiK64x3w1an1Er8KiH6gd3HeU1_B96HSj6x88OOZ_eaLiAlh7bx45lxRbPhucVXFMvyotcqrKvQNB7Ra9-X1h6ueZDsX3PtMytjWWYg0s4FxouVu6rrX4z0YFB3prcDF8cmUzyCYm_yikPDqX_381J5c6DKCbN5siCsQoOn297Q4IyXr56fk3Vhe2tnFgzbfJN21FcUfICausgei7xg0aDbv_Ql9stgzJssQw_Tr2ZZKWtDHjpM_jDJOXvRLnwsXg.ygA5L4vrUoQCZiB6ohqjSrt8dHkXDg2m_Q-CRySGsS8&dib_tag=se&keywords=water+shoes&qid=1744281232&sprefix=water+shoes%2Caps%2C273&sr=8-1&linkCode=ll1&tag=googlementor-20&linkId=93478b564d659a64ecb260bfbd6a023c&language=en_US&ref_=as_li_ss_tl',
  },
  {
    id: 'travel-luggage-lock',
    name: 'Travel Luggage Lock',
    description: 'Secure your belongings.',
    image: '/assets/images/lock.jpg',
    link: 'https://www.amazon.com/Compatible-Travel-Luggage-Inspection-Indicator/dp/B073NYB7R2?crid=193YCY2P4WJR4&dib=eyJ2IjoiMSJ9.gk-FsnfAsrB47YFDiXxMZr4w4lgP23Tqz7Vz1m0VIcIxhhB-qf4rTBPMshxuzn7eDjVo_EIy3oMMztzefkXVcD3pVcQ0OaDKEfgkMV2Y2VGhefOSPIAbVkKbfWsME9aeoEyyy75OIfkRM9eLL0ZWDX91_Hh9w1JThAmanWbAm--GLXHNedqncyDGtAWuxKVtiThk8abcr0ug6lAaRvS6izTTVGJ9i_OmPDPrrQqpWrJl5nyx_nchT9ee-T7oQ6Gydgt1tRQbNPk-GG5GV4Dve8AFucT9FM1Y861m9O5bwiY.HT4ld4jRTAzqdjzrYDoHvJYfvcaDV3k41C2nKKJRe38&dib_tag=se&keywords=luggage%2Block&qid=1744297813&sprefix=luggage%2Block%2Caps%2C266&sr=8-2&th=1&linkCode=ll1&tag=googlementor-20&linkId=f60ff431657ac0a3dc911b8b1c082318&language=en_US&ref_=as_li_ss_tl',
  },
  {
    id: 'dry-bag-waterproof',
    name: 'Dry Bag Waterproof',
    description: 'Keep your belongings dry.',
    image: '/assets/images/waterbag.jpg',
    link: 'https://www.amazon.com/HEETA-Waterproof-Lightweight-Backpack-Transparent/dp/B07PLZP5LN?crid=2S45C5LWP7B8C&dib=eyJ2IjoiMSJ9.04dV5-nTjb_XJlbT6NyZUC1h2Y_hDzZ4TBvQ94SqYoyL9VQq6uvOv7aI3Cv_Is5nIYXzmexSi81ePUFvNJVLle-9SBw7eUuwB1AwFLAPsJpFvmMvnFp7lK0D_vKXGnbcreI2HtG24XF6uiPk8RMF19oEO4tg6sp1IdVwz9OnLEbqpeknRxSRoTeYryP3_KCOY3mtDI_57KTwH-aG-cQQxuc0uJtPph2PnZn88Mv_BX8geryUVVvuuTngrxZa3_HsNljlHeanHyv7ewlC2meSHD7hSi9izeXdgo6JwQeKMQQ.s5-nBJejLDvzZsHHOKyTbXF5NCMwpWSzUDZddxyVn-8&dib_tag=se&keywords=dry%2Bbag%2Bwaterproof&qid=1744282796&sprefix=dry%2Bbag%2B%2Caps%2C264&sr=8-2&th=1&linkCode=ll1&tag=googlementor-20&linkId=53007ac01d6feb4e5350f5827f915ec2&language=en_US&ref_=as_li_ss_tl',
  },
  {
    id: 'portable-charger-20000mah',
    name: 'Portable Charger 20000mAh',
    description: 'Charge multiple devices.',
    image: '/assets/images/charger.jpg',
    link: 'https://www.amazon.com/INIU-Portable-20000mAh-High-speed-Flashlight/dp/B07YPY31FL?crid=1XSBI2DD4MBI3&dib=eyJ2IjoiMSJ9.CZlI-b10iXOHhb1rmCebQ5pDKUotPusAaFPEu8XSDTm7KcdiWrT22WwyVSuZUn6drRlqXZBNAHJ7e4LZeolR-w-HP61bxkUMIZgDjk_BQobAX4j6bxfaMHAXp73aGxXF9SZ8E-GR4jRJzSSyzpX3VWP-NmzVisQUQMi-RzV1e2NpXrXqrAg2AJ5ic0GKH1WNIc6IOouEI3vin2Ki-t6Qeh_46j39WTIAElT7G95fZTw.Xkng_Yvwx6COR4I8_1KOB2ycYa7ik4Nw_BKMcom8aPY&dib_tag=se&keywords=power%2Bbank&qid=1744281640&sprefix=powerbank%2Caps%2C267&sr=8-3&th=1&linkCode=ll1&tag=googlementor-20&linkId=15bde893fcb2936e8586db2e6dc66509&language=en_US&ref_=as_li_ss_tl',
  },
  {
    id: 'car-charger',
    name: 'Car Charger',
    description: 'Charge your devices on the go.',
    image: '/assets/images/car-charger.jpg',
    link: 'https://www.amazon.com/LISEN-Retractable-Charger-Charging-Accessories/dp/B0D4215HCX?crid=1L7E0RTPVSUPD&dib=eyJ2IjoiMSJ9.JsSdZgc4aAPVec63UKw8Xhw3dVkz8thJ_AtlAaVHVRmXgMennzu3n8Y9anULK9xXDh2bZB1PoL_ZDVNbbLqiL3FUQ9ZdD9PW_G6k0GQU_6Kgxpu6OuGrFgyY1FC9WoHNM3IhWK8rUOCOw1uNjki2l-60VZMNFC4RUqwoZwhdJ54XvaxuPZfYAoqq2PoIG4rutJe29YrPvXEdlPp-h-Hqh7TzNEY3CmQzfxhOTe8cOxvucf0E4G05xU0OwZkZYXa4p9Vs-HgeTlLNOAY_zmZTdy2YdoMTJ-f62DNHZ0ND_g0.UTJ3kS419Duz_s2Vwm5e3un3W38A-lGwq4i7qGwQGZc&dib_tag=se&keywords=travel%2Bessentials&qid=1744917036&sprefix=travel%2B%2Caps%2C917&sr=8-1&th=1&linkCode=ll1&tag=googlementor-20&linkId=96b0b67ebe5a89dc8ce460a897c8fef0&language=en_US&ref_=as_li_ss_tl',
  },
  {
    id: 'sun-protection-shirt',
    name: 'Sun Protection Shirt',
    description: 'Stay protected from the sun.',
    image: '/assets/images/swimshirt.jpg',
    link: 'https://www.amazon.com/Roadbox-Protection-Outdoor-Rashguard-Campanula/dp/B08BFKM7VT?crid=1B8XWMGNDMHZ&dib=eyJ2IjoiMSJ9.oqmEbNu4aZG54M33PmwZ0dhEhnzU6rCJCqfB6kTFE-OYrQ-VSeNQpoHKr9xz906Qe_LYneUjbRFXHvr6Q3c48hdlKAYemI6qMk9Q_8qZ0JYtn3spkoeuh6269le8cetUa-Dlc5pXu5n_tWLWy3KBmuTEtdRiSjkny5EhO3TBxxMyqvcFnbun1M3uoiFHM7H28xKHFScQCdogE2OwAvzEBdwKgEWCwMPl5pIPcCsKCfkJTBIJMVcYRzz-gQzHicJ6Xs8uVLgC65LhfSYdeyX6w2jpAAZhBBBtiRiCm2sXBk8.7yIAVVvHWW2ASwNxiOlDxl-9aPLno0LDjoqPWxRPjME&dib_tag=se&keywords=swim+shirt&qid=1744282276&sprefix=swim+shirt%2Caps%2C219&sr=8-1&linkCode=ll1&tag=googlementor-20&linkId=a7ef3772cb9cfe23053d42d546045fb4&language=en_US&ref_=as_li_ss_tl',
  },
  {
    id: 'mini-bluetooth-speaker',
    name: 'Mini Bluetooth Speaker',
    description: 'Enjoy music anywhere with JBL Go 3.',
    image: '/assets/images/jbl.jpg',
    link: 'https://www.amazon.com/JBL-Bluetooth-Built-Waterproof-Dustproof/dp/B08KW1KR5H?crid=3VUTW189394ED&dib=eyJ2IjoiMSJ9.FGkEwxm3QNHRWWQy2KNYz333rFfCFhE2oVPUD7ERc7gdb4h9-r-iJGDD3k2FAhT0_hjnGeKdBRvQ23JkhKEY0RaRfPVQdOxKEn16t5fHuN9qiQSQznJs_8Plru1vltrDK1oxTcsKO3PzNBtxBtXH5dnSB8HjX0lWcJqrOQcYAQqeBoIK3bwu5Ih0kB-oZjMaqvXLPNNMW0QQcaZ8Y6VMWNx2T6hy4SVjCnS5Kq-tiBE.Mqw-uR3eFoYa5iRHfJIR6cDp510BPAvZyEk6R-wuLMs&dib_tag=se&keywords=bluetooth%2Bspeakers%2Bwireless&qid=1744282386&sprefix=blue%2Btoothspeaker%2Caps%2C225&sr=8-2&th=1&linkCode=ll1&tag=googlementor-20&linkId=7d562457ac35b6410528d256fe68d12c&language=en_US&ref_=as_li_ss_tl',
  },
  {
    id: 'sony-wireless-headphones',
    name: 'Sony Wireless Noise Canceling Headphones',
    description: 'Experience immersive sound.',
    image: '/assets/images/headphones.jpg',
    link: 'https://www.amazon.com/Sony-WH-1000XM5-Canceling-Headphones-Hands-Free/dp/B09XS7JWHH?crid=1RILF5NJQL3QY&dib=eyJ2IjoiMSJ9.DybUtroQtxKRVf4Ik5FOzxJ0mhEi0WjWYUvm2CrA3GBilVNix93n6qTXoFLT4RVeyw1I4aOiu-hwEH0W_giTBsc7a5qGIKkfXG5bD-cTYyyF6gA7bOAn8dojwYF5z-TkL-4XdshNVjG6Z7kRpRKkrLwu-TPuCtqRODc6-XvYfHBghRpiGafQH9yV9VHpWiuDYvp_ch__xOQ1d_gmwQiKfezEIYX5gUYWLxv2_ZQdHVlhu7nSWIQyDZtNGzwwn40-0LLLzQwiawQAITBq8D2gYeC7soLiNKC8qX-padSv34k.STSJ1OExZmEzn9uvfm7co0aEIF8BiZPXv_x71XJm1qw&dib_tag=se&keywords=Sony%2BWH-1000XM5&qid=1743662318&sbo=eyPEepoLJVEU2NRNeETf0Q%3D%3D&sprefix=sony%2Bwh-1000xm5%2Caps%2C385&sr=8-1&th=1&linkCode=ll1&tag=googlementor-20&linkId=90e4c1c011b622b6f17a9047a139e41e&language=en_US&ref_=as_li_ss_tl',
  },
  {
    id: 'nordic-walking-poles',
    name: 'Nordic Walking Poles',
    description: 'Perfect for hiking and walking.',
    image: '/assets/images/poles.png',
    link: 'https://www.amazon.com/TheFitLife-Nordic-Walking-Trekking-Poles/dp/B01N57G27J?crid=UAZRC5HNXR1V&dib=eyJ2IjoiMSJ9.ZxKQyk-7wWYfgH8-VJjhURO5Mkk_Y0qPwdesgZi4IusU09S-93TGDDnEZn9MsLYfMerKzbLflZMwwZd0TnIy-NOLlWqwKS6X4Nk4SFNp0kosbdVcJaY2_XH_NqSVpNwSsFJpaIl4AvmDCfoo3UB6MaFaWFoMuKPx9O87eXqQ0CVTTfE_h3N_6Dqhnsb0l6pjeOaABLne3NxYxaCDRxV7zNl3WvT-KaGqs0ljYxKP05w.2q493ibjiNGdUHZhVXEyDPAe4lgzeKREOFxsnut6uR4&dib_tag=se&keywords=nordic%2Bhiking%2Bpoles&qid=1744792912&sprefix=nordic%2Bhiking%2Caps%2C255&sr=8-3&th=1&linkCode=ll1&tag=googlementor-20&linkId=57e459ca010825efe0c025e8354f2db4&language=en_US&ref_=as_li_ss_tl',
  },
  {
    id: 'anker-multi-usb-port',
    name: 'Anker Multi USB Port',
    description: 'Charge multiple devices at once.',
    image: '/assets/images/usbports.jpg',
    link: 'https://www.amazon.com/Anker-Display-MacBook-Thinkpad-Laptops/dp/B0BQLLB61B?crid=3D49RTF3E7DHJ&dib=eyJ2IjoiMSJ9.Do0A8AsPHyHc1NFcnh3svm3AnNZ2HiccAimNCAGFPtTAFx7LlhPYaMjzSVPoMRF_chNEXjYvJrYtiCnRkB4L_Pw--__l9zHfA3HDgqntUX5aqJZ2opYu_7iiXxccCMwpqkdlsmFXrc97PrkEntC3MsdVAT_GqHRbvFs4WWIv1kMrWZ83s_7J5GfnXDud2JKBA7nKiFS-11lv6rtRGUSwM8xjbHsy-YCGGspZkA2Tlpo.VwKjls_SH5YzJU4VKU_VuT6VVK63R36ed-sqlEyojvQ&dib_tag=se&keywords=multi%2Busb%2Bport&qid=1744794809&sprefix=multi%2Busb%2Bport%2Caps%2C249&sr=8-2&th=1&linkCode=ll1&tag=googlementor-20&linkId=06d1704430ca77f693bf6f68c7f1cfd7&language=en_US&ref_=as_li_ss_tl',
  },
  // Add similar IDs for the remaining items
];

const Store: React.FC = () => {
  const [visibleProducts, setVisibleProducts] = useState(8);
  
  const handleViewMore = () => {
    setVisibleProducts((prev) => prev + 12);
  };
  return (
    <div id="store" className="bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl text-center">
        Shop Travel-Themed Gifts
        </h2>
        <p className="mt-4 text-lg text-gray-600 text-center">
          Make your life easier.
        </p>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.slice(0, visibleProducts).map((product, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <a
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              </a>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2 h-8 overflow-hidden">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 h-10 overflow-hidden">
                  {product.description}
                </p>
                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-primary font-medium hover:underline"
                >
                  Learn More
                </a>
              </div>
            </div>
          ))}
        </div>
        {visibleProducts < products.length && (
          <div className="mt-8 text-center">
            <button
              onClick={handleViewMore}
              className="px-6 py-3 bg-primary text-white font-medium rounded-lg shadow-md hover:bg-secondary transition duration-300"
            >
              View More Products
            </button>
          </div>
        )}
        <p className="mt-8 text-sm text-gray-500 text-center">
          Note: We may earn a commission if you purchase through these links.
        </p>
      </div>
    </div>
  );
};

export default Store;