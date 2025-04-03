import React from 'react';

const products = [
  {
    name: 'Mini Power Bank',
    description: 'Stay charged on the go.',
    image: '/assets/images/powerbank.jpg', // Replace with actual image paths
    link: 'https://www.amazon.com/INIU-Portable-Charging-10000mAh-Tablets/dp/B09176JCKZ?crid=3PK4S3TX25SJT&dib=eyJ2IjoiMSJ9.NNtcMx3tBl4KYMENUAY8Ve4s_J_LjtJoQK_Tw5985l6gIfuEiSZmrU7f61vSf9trDRp5u2M7kZ4HrTJZPq5UqxnEy5ExWhNCMpU4JvdVk_txB7YqvLCNUA7Y4lyI0p1wS2vtAXun-34OwPEH-i-5cXFQkUQGuUsqANcNVRNanH4WicaPqITMWAK3ehACFntRr6QYROxpz5hlLueP08qQwa8dWkiA1opcCG7aWT3-pAs.vp_OiVQE-TDgftHGuSOVYSaUd48YRr4YYf-B5niH7Ao&dib_tag=se&keywords=mini%2BPower%2BBank&qid=1743661618&sprefix=mini%2Bpower%2Bbank%2Caps%2C348&sr=8-3&th=1&linkCode=ll1&tag=googlementor-20&linkId=198fffbd61d177ebff759a6f0793867d&language=en_US&ref_=as_li_ss_tl', // Affiliate link placeholder
  },
  {
    name: 'Universal Travel Adapter',
    description: 'Charge anywhere in the world.',
    image: '/assets/images/adapter.jpg',
    link: 'https://www.amazon.com/NEWVANGA-International-Universal-Worldwide-Charging/dp/B01FO4W5W2?crid=28IMN2VY22YN7&dib=eyJ2IjoiMSJ9.jJ5JSSoMLRaR3Hs-XHxku86MnNJRH365FkZhxTtWXCPN0QQ8pPQBQcprISWu5Z-Q9nMnoGUUKb4YF1CIGf526FDBhfd5D5xuQKMU1LKdkDTJXilM7I3tSQGSqAP1MefzATfITwcsgaSXquY_6XRJXXxLTOFW0Exl3H8Fj3fituy7nCYIFNEFOrhvD3Ewu7zf84FJDvjlN6DSqJy2j4h-B-SKAXUd-l7ZYKXAor1AyVjM8jOBjJfm-KgVrPgD77hadOIAwWnviwR8jXNtsYpcP-7_Ldbw9KuCKDJBSfBt5T8.7LnubVDXoBTeUbNW964t3QmLTk7hwMnbsGHMCyLXj1s&dib_tag=se&keywords=Universal%2BTravel%2BAdapter&qid=1743661696&sprefix=universal%2Btravel%2Badapter%2Caps%2C281&sr=8-6&th=1&linkCode=ll1&tag=googlementor-20&linkId=138bf86aa348318d5c924b0c3a956757&language=en_US&ref_=as_li_ss_tl',
  },
  {
    name: 'Tile GPS Tracker',
    description: 'Never lose your belongings again.',
    image: '/assets/images/tile.jpg',
    link: 'https://www.amazon.com/Tile-Life360-Bluetooth-Tracker-Compatible/dp/B0D63657GY?crid=1DQMOW5YLB3UL&dib=eyJ2IjoiMSJ9.SZZ7duJsi3EtIqYaSf-Lxx8dI63Ku87qfw4p7tbWwuqDwjTNp362RfW_8WHPEwKh4PuFL8YlZQ0oyNhX516zc98zlemE9UGsy_a8Z0xWcx4bSRUxJHS8KYDxFgUYAVMfTp0kZvSjmc_leO4Whu6Oj-SQIkBmbauOR3KIacwN0-r9pPLYhh4z7FUYYStag8uvGv7vlVhgrgcAbO9jiw7-8-Jggm5ew-7yCumrG8wFwdo.xiJqztHhTbzLQJ3UC67P1R92hmurWaamBPy-nB0pybA&dib_tag=se&keywords=GPS%2BTracker&qid=1743661824&sprefix=gps%2Btracker%2Caps%2C245&sr=8-14&th=1&linkCode=ll1&tag=googlementor-20&linkId=7d7bdc11f04ea0ea7014094d2986365a&language=en_US&ref_=as_li_ss_tl',
  },
  {
    name: 'Apple AirTag',
    description: 'Keep track of your items.',
    image: '/assets/images/airtag.jpg',
    link: 'https://www.amazon.com/Apple-MX532LL-A-AirTag/dp/B0CWXNS552?crid=2SI1OO86CUKRC&dib=eyJ2IjoiMSJ9.eJ4jVW3fBNhHFl2sL9cZHHrfluVwfLNuHJyQMwz4nj7HJkO6koRmxSdJ4ErwjGB_EO6uM2uEx4H8AfzH_dkA6PyXc8nh1jeJtJ0XK2qeZ5ytWx9uGzzp6OWoPmHtxnzxDVxO6N4shMtfJeXIEps7Gl2FXJUt9rLBQSwRzM5xTMVIObAs46RGVlXfFwWqPNvmljuiqlWzHZ60AvyXfreVn6RRqcnXCQ-Ajln506wdWadpP3MZWVIxQcRgG4PA3kzchnoQkadbtYAU1RKvJ31BrHOjc71GgfA3iQbll8_bdH8.N_AQnxY3IK88wpIuqWAWvBU0O86stDB5hSc0IesBGV8&dib_tag=se&keywords=apple+airtag&qid=1743662087&sprefix=apple+airtag%2Caps%2C231&sr=8-1&linkCode=ll1&tag=googlementor-20&linkId=6e55276863fd379898e8ecfb3080119a&language=en_US&ref_=as_li_ss_tl',
  },
  {
    name: 'Sony Wireless Noise Canceling Headphones',
    description: 'Experience immersive sound.',
    image: '/assets/images/headphones.jpg',
    link: 'https://www.amazon.com/Sony-WH-1000XM5-Canceling-Headphones-Hands-Free/dp/B09XS7JWHH?crid=1RILF5NJQL3QY&dib=eyJ2IjoiMSJ9.DybUtroQtxKRVf4Ik5FOzxJ0mhEi0WjWYUvm2CrA3GBilVNix93n6qTXoFLT4RVeyw1I4aOiu-hwEH0W_giTBsc7a5qGIKkfXG5bD-cTYyyF6gA7bOAn8dojwYF5z-TkL-4XdshNVjG6Z7kRpRKkrLwu-TPuCtqRODc6-XvYfHBghRpiGafQH9yV9VHpWiuDYvp_ch__xOQ1d_gmwQiKfezEIYX5gUYWLxv2_ZQdHVlhu7nSWIQyDZtNGzwwn40-0LLLzQwiawQAITBq8D2gYeC7soLiNKC8qX-padSv34k.STSJ1OExZmEzn9uvfm7co0aEIF8BiZPXv_x71XJm1qw&dib_tag=se&keywords=Sony%2BWH-1000XM5&qid=1743662318&sbo=eyPEepoLJVEU2NRNeETf0Q%3D%3D&sprefix=sony%2Bwh-1000xm5%2Caps%2C385&sr=8-1&th=1&linkCode=ll1&tag=googlementor-20&linkId=90e4c1c011b622b6f17a9047a139e41e&language=en_US&ref_=as_li_ss_tl',
  },
  {
    name: 'Waterproof Phone Case',
    description: 'Protect your phone at the beach.',
    image: '/assets/images/phonecase.jpg',
    link: 'https://www.amazon.com/Lamicall-Waterproof-Phone-Pouch-Case/dp/B0BQRDKRL6?crid=OGV98TJ7YOCU&dib=eyJ2IjoiMSJ9.rvdGKthxZZQp1d8I-eHoxHlzPyaY547vZ48m43gd_FOYCT1rfHHa_pz_Vw8eWGjTBxn1PLfcsJmq_EYsJyRXH7hxJWFe_GziDMKS4FIBLAEcBy8XupPK_7ZL3Zmoz-o0xEgyNFcSzNLdmNxbXHZenzMHJY7xdUrx7HBtncDG6qRH4-Kq4HNnsPSlF-PerK2wYkLW4yoU3xLFlWE6TlKgLN_QpclCDYtSNXJLwwM9aks.oxyhtaoXkD1Y-wrxQR5lt5sKSdPBXqzDowSgHLhQjjA&dib_tag=se&keywords=waterproof%2Bphone%2Bcase&qid=1743662562&sprefix=waterproof%2Bphone%2B%2Caps%2C236&sr=8-1&th=1&linkCode=ll1&tag=googlementor-20&linkId=6304637682d9023a1e744f35066cf416&language=en_US&ref_=as_li_ss_tl',
  },
  {
    name: 'GoPro Waterproof Camera',
    description: 'Capture your adventures.',
    image: '/assets/images/gopro.jpg',
    link: 'https://www.amazon.com/GoPro-HERO13-Black-Compatability-HB/dp/B0DCM34GXX?crid=10NCBQXUPNIH5&dib=eyJ2IjoiMSJ9.vkUjTAHT7MzwSo8RLmaAIp9RO7yu-UJcV0r8sDakFQkUZ-S6qgGtpV2bY-q9ABitJddX-UuLMr-KjXFUd15I8zblmyiCG5QR3erM53m_fl3zoXoZinONcs9TIbtKAHGR1o_OfJb49i000RvmrXucLty237wZHTNis1nzjsmhXFPlXlqDaTVWj_5y2PZjNg2YmpvYAWVjwhrhTSGH26_b0ESYNlfXy3NXlyIvHNETya8zaUGdRLhSpyMz9L8xU8AvzdYSMtKA5GPSt34V1F36f7SaJ0PZkvpWdz42ZfPqYfk.Y-bq2WZKAjFxYo6K3jQ_--n1fXZQjK2yyOiZisphMvk&dib_tag=se&keywords=go%2Bpro&qid=1743662645&sprefix=go%2Bpro%2Caps%2C220&sr=8-1&th=1&linkCode=ll1&tag=googlementor-20&linkId=c854de0fa5e66affb72aa06958655e74&language=en_US&ref_=as_li_ss_tl',
  },
];

const Store: React.FC = () => {
  return (
    <div id="store" className="bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl text-center">
          Our Recommended Products
        </h2>
        <p className="mt-4 text-lg text-gray-600 text-center">
          Make your life easier.
        </p>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
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
                  className="w-full h-64 object-cover"
                />
              </a>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  {product.name}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
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
        <p className="mt-8 text-sm text-gray-500 text-center">
          Note: These are affiliate links to Amazon. We may earn a commission if you purchase through these links.
        </p>
      </div>
    </div>
  );
};

export default Store;