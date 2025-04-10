import React, { useState } from 'react';

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
    name: 'e-SIM Card',
    description: 'Best solution for mobile data.',
    image: '/assets/images/airalo.webp',
    link: 'https://www.airalo.com/',
  },
  {
    name: 'Water Shoes',
    description: 'Perfect for beach and water activities.',
    image: '/assets/images/watershoes.jpg',
    link: 'https://www.amazon.com/ATHMILE-Quick-Dry-Barefoot-Exercise-Accessories/dp/B09Q3MYDQH?crid=29GN13UM8DI65&dib=eyJ2IjoiMSJ9.NPjF_UkxH8HkjqvHP02DhqOsxKSBgQWtxxIVPvkvj_uiK64x3w1an1Er8KiH6gd3HeU1_B96HSj6x88OOZ_eaLiAlh7bx45lxRbPhucVXFMvyotcqrKvQNB7Ra9-X1h6ueZDsX3PtMytjWWYg0s4FxouVu6rrX4z0YFB3prcDF8cmUzyCYm_yikPDqX_381J5c6DKCbN5siCsQoOn297Q4IyXr56fk3Vhe2tnFgzbfJN21FcUfICausgei7xg0aDbv_Ql9stgzJssQw_Tr2ZZKWtDHjpM_jDJOXvRLnwsXg.ygA5L4vrUoQCZiB6ohqjSrt8dHkXDg2m_Q-CRySGsS8&dib_tag=se&keywords=water+shoes&qid=1744281232&sprefix=water+shoes%2Caps%2C273&sr=8-1&linkCode=ll1&tag=googlementor-20&linkId=93478b564d659a64ecb260bfbd6a023c&language=en_US&ref_=as_li_ss_tl',
  },
  {
    name: 'Travel Luggage Lock',
    description: 'Secure your belongings.',
    image: '/assets/images/lock.jpg',
    link: 'https://www.amazon.com/Compatible-Travel-Luggage-Inspection-Indicator/dp/B073NYB7R2?crid=193YCY2P4WJR4&dib=eyJ2IjoiMSJ9.gk-FsnfAsrB47YFDiXxMZr4w4lgP23Tqz7Vz1m0VIcIxhhB-qf4rTBPMshxuzn7eDjVo_EIy3oMMztzefkXVcD3pVcQ0OaDKEfgkMV2Y2VGhefOSPIAbVkKbfWsME9aeoEyyy75OIfkRM9eLL0ZWDX91_Hh9w1JThAmanWbAm--GLXHNedqncyDGtAWuxKVtiThk8abcr0ug6lAaRvS6izTTVGJ9i_OmPDPrrQqpWrJl5nyx_nchT9ee-T7oQ6Gydgt1tRQbNPk-GG5GV4Dve8AFucT9FM1Y861m9O5bwiY.HT4ld4jRTAzqdjzrYDoHvJYfvcaDV3k41C2nKKJRe38&dib_tag=se&keywords=luggage%2Block&qid=1744297813&sprefix=luggage%2Block%2Caps%2C266&sr=8-2&th=1&linkCode=ll1&tag=googlementor-20&linkId=f60ff431657ac0a3dc911b8b1c082318&language=en_US&ref_=as_li_ss_tl',
  },
  {
    name: 'Dry Bag Waterproof',
    description: 'Keep your belongings dry.',
    image: '/assets/images/waterbag.jpg',
    link: 'https://www.amazon.com/HEETA-Waterproof-Lightweight-Backpack-Transparent/dp/B07PLZP5LN?crid=2S45C5LWP7B8C&dib=eyJ2IjoiMSJ9.04dV5-nTjb_XJlbT6NyZUC1h2Y_hDzZ4TBvQ94SqYoyL9VQq6uvOv7aI3Cv_Is5nIYXzmexSi81ePUFvNJVLle-9SBw7eUuwB1AwFLAPsJpFvmMvnFp7lK0D_vKXGnbcreI2HtG24XF6uiPk8RMF19oEO4tg6sp1IdVwz9OnLEbqpeknRxSRoTeYryP3_KCOY3mtDI_57KTwH-aG-cQQxuc0uJtPph2PnZn88Mv_BX8geryUVVvuuTngrxZa3_HsNljlHeanHyv7ewlC2meSHD7hSi9izeXdgo6JwQeKMQQ.s5-nBJejLDvzZsHHOKyTbXF5NCMwpWSzUDZddxyVn-8&dib_tag=se&keywords=dry%2Bbag%2Bwaterproof&qid=1744282796&sprefix=dry%2Bbag%2B%2Caps%2C264&sr=8-2&th=1&linkCode=ll1&tag=googlementor-20&linkId=53007ac01d6feb4e5350f5827f915ec2&language=en_US&ref_=as_li_ss_tl',
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
    name: 'Apple AirTag',
    description: 'Keep track of your items.',
    image: '/assets/images/airtag.jpg',
    link: 'https://www.amazon.com/Apple-MX532LL-A-AirTag/dp/B0CWXNS552?crid=2SI1OO86CUKRC&dib=eyJ2IjoiMSJ9.eJ4jVW3fBNhHFl2sL9cZHHrfluVwfLNuHJyQMwz4nj7HJkO6koRmxSdJ4ErwjGB_EO6uM2uEx4H8AfzH_dkA6PyXc8nh1jeJtJ0XK2qeZ5ytWx9uGzzp6OWoPmHtxnzxDVxO6N4shMtfJeXIEps7Gl2FXJUt9rLBQSwRzM5xTMVIObAs46RGVlXfFwWqPNvmljuiqlWzHZ60AvyXfreVn6RRqcnXCQ-Ajln506wdWadpP3MZWVIxQcRgG4PA3kzchnoQkadbtYAU1RKvJ31BrHOjc71GgfA3iQbll8_bdH8.N_AQnxY3IK88wpIuqWAWvBU0O86stDB5hSc0IesBGV8&dib_tag=se&keywords=apple+airtag&qid=1743662087&sprefix=apple+airtag%2Caps%2C231&sr=8-1&linkCode=ll1&tag=googlementor-20&linkId=6e55276863fd379898e8ecfb3080119a&language=en_US&ref_=as_li_ss_tl',
  },
  {
    name: 'Portable Charger 20000mAh',
    description: 'Charge multiple devices.',
    image: '/assets/images/charger.jpg',
    link: 'https://www.amazon.com/INIU-Portable-20000mAh-High-speed-Flashlight/dp/B07YPY31FL?crid=1XSBI2DD4MBI3&dib=eyJ2IjoiMSJ9.CZlI-b10iXOHhb1rmCebQ5pDKUotPusAaFPEu8XSDTm7KcdiWrT22WwyVSuZUn6drRlqXZBNAHJ7e4LZeolR-w-HP61bxkUMIZgDjk_BQobAX4j6bxfaMHAXp73aGxXF9SZ8E-GR4jRJzSSyzpX3VWP-NmzVisQUQMi-RzV1e2NpXrXqrAg2AJ5ic0GKH1WNIc6IOouEI3vin2Ki-t6Qeh_46j39WTIAElT7G95fZTw.Xkng_Yvwx6COR4I8_1KOB2ycYa7ik4Nw_BKMcom8aPY&dib_tag=se&keywords=power%2Bbank&qid=1744281640&sprefix=powerbank%2Caps%2C267&sr=8-3&th=1&linkCode=ll1&tag=googlementor-20&linkId=15bde893fcb2936e8586db2e6dc66509&language=en_US&ref_=as_li_ss_tl',
  },
  {
    name: 'Mini Bluetooth Speaker',
    description: 'Enjoy music anywhere with JBL Go 3.',
    image: '/assets/images/jbl.jpg',
    link: 'https://www.amazon.com/JBL-Bluetooth-Built-Waterproof-Dustproof/dp/B08KW1KR5H?crid=3VUTW189394ED&dib=eyJ2IjoiMSJ9.FGkEwxm3QNHRWWQy2KNYz333rFfCFhE2oVPUD7ERc7gdb4h9-r-iJGDD3k2FAhT0_hjnGeKdBRvQ23JkhKEY0RaRfPVQdOxKEn16t5fHuN9qiQSQznJs_8Plru1vltrDK1oxTcsKO3PzNBtxBtXH5dnSB8HjX0lWcJqrOQcYAQqeBoIK3bwu5Ih0kB-oZjMaqvXLPNNMW0QQcaZ8Y6VMWNx2T6hy4SVjCnS5Kq-tiBE.Mqw-uR3eFoYa5iRHfJIR6cDp510BPAvZyEk6R-wuLMs&dib_tag=se&keywords=bluetooth%2Bspeakers%2Bwireless&qid=1744282386&sprefix=blue%2Btoothspeaker%2Caps%2C225&sr=8-2&th=1&linkCode=ll1&tag=googlementor-20&linkId=7d562457ac35b6410528d256fe68d12c&language=en_US&ref_=as_li_ss_tl',
  },
  {
    name: 'Sun Protection Shirt',
    description: 'Stay protected from the sun.',
    image: '/assets/images/swimshirt.jpg',
    link: 'https://www.amazon.com/Roadbox-Protection-Outdoor-Rashguard-Campanula/dp/B08BFKM7VT?crid=1B8XWMGNDMHZ&dib=eyJ2IjoiMSJ9.oqmEbNu4aZG54M33PmwZ0dhEhnzU6rCJCqfB6kTFE-OYrQ-VSeNQpoHKr9xz906Qe_LYneUjbRFXHvr6Q3c48hdlKAYemI6qMk9Q_8qZ0JYtn3spkoeuh6269le8cetUa-Dlc5pXu5n_tWLWy3KBmuTEtdRiSjkny5EhO3TBxxMyqvcFnbun1M3uoiFHM7H28xKHFScQCdogE2OwAvzEBdwKgEWCwMPl5pIPcCsKCfkJTBIJMVcYRzz-gQzHicJ6Xs8uVLgC65LhfSYdeyX6w2jpAAZhBBBtiRiCm2sXBk8.7yIAVVvHWW2ASwNxiOlDxl-9aPLno0LDjoqPWxRPjME&dib_tag=se&keywords=swim+shirt&qid=1744282276&sprefix=swim+shirt%2Caps%2C219&sr=8-1&linkCode=ll1&tag=googlementor-20&linkId=a7ef3772cb9cfe23053d42d546045fb4&language=en_US&ref_=as_li_ss_tl',
  },
  {
    name: 'Sun Hat',
    description: 'Stay cool and protected from the sun.',
    image: '/assets/images/hat.jpg',
    link: 'https://www.amazon.com/Summer-Panama-Straw-Fedora-Beach/dp/B07BNNNSX5?crid=35H30J30GZNOC&dib=eyJ2IjoiMSJ9.tU3Ad7L_jXc45PW0ksQAAhL5tqfFEPZKValKUTy45xneWX-9nJwuHOJ3JnYbhQmwtgJu35hR689run1JS7rpVlBr9J-w2rZiVU-rg4P3mWZJ6jnzL8v8x1VS_pif7wCHOcCUcHPSti89nug87S-nNpGbbMaERDQvPPtwYTe9wmTtdbDmJfQjgjUoLAMGpxEaUsDjXmtzpGmytlhwn-mivuGXjfUacmMMaZRGd0ctoyihrGj9ii3x5O7C6tEAJEDOkWPDGrdIoTqM8IJ4-E6CDrUI6nAJtagnhlVZRzGp_ck.W_8kxKL5rk-jHa0lU_xTt6_2yfl49-zwKfUIL3b8VI8&dib_tag=se&keywords=hat+for+sun&qid=1743773805&sprefix=hat+for+sun%2Caps%2C218&sr=8-16&linkCode=ll1&tag=googlementor-20&linkId=2fd025d345af310cc3f1a33161f33fbc&language=en_US&ref_=as_li_ss_tl',
  },
  {
    name: 'Tile GPS Tracker',
    description: 'Never lose your belongings again.',
    image: '/assets/images/tile.jpg',
    link: 'https://www.amazon.com/Tile-Life360-Bluetooth-Tracker-Compatible/dp/B0D63657GY?crid=1DQMOW5YLB3UL&dib=eyJ2IjoiMSJ9.SZZ7duJsi3EtIqYaSf-Lxx8dI63Ku87qfw4p7tbWwuqDwjTNp362RfW_8WHPEwKh4PuFL8YlZQ0oyNhX516zc98zlemE9UGsy_a8Z0xWcx4bSRUxJHS8KYDxFgUYAVMfTp0kZvSjmc_leO4Whu6Oj-SQIkBmbauOR3KIacwN0-r9pPLYhh4z7FUYYStag8uvGv7vlVhgrgcAbO9jiw7-8-Jggm5ew-7yCumrG8wFwdo.xiJqztHhTbzLQJ3UC67P1R92hmurWaamBPy-nB0pybA&dib_tag=se&keywords=GPS%2BTracker&qid=1743661824&sprefix=gps%2Btracker%2Caps%2C245&sr=8-14&th=1&linkCode=ll1&tag=googlementor-20&linkId=7d7bdc11f04ea0ea7014094d2986365a&language=en_US&ref_=as_li_ss_tl',
  },
  {
    name: 'Water Bottle with Handle and Straw',
    description: 'Stay hydrated anywhere.',
    image: '/assets/images/water.jpg',
    link: 'https://www.amazon.com/Simple-Modern-Tumbler-Handle-Insulated/dp/B0BHBP1X1B?crid=3RI1W7M2W0EW7&dib=eyJ2IjoiMSJ9.IYTNOMeir5gVqD73IVSo6KwFXMZXivVlGJ52_2l8I-l30U8jWMH3tNYgnk18A_5ExPS9-mGGh1WYfBFnIb1HCyAp2T9WA5nqH_nvKBqza2EOmJ-kEOwAnDUoC04NqzDx1YCdMQQqRxiWQWHvrrIIFNm31fOxCMq5F01TPm8hZgPfP5HcnFXoZ5Esd-HfSwKDzvZtsyK6q_3SQXnM4h55d1CtePSOJsE2-PKtpef4ShALsrEXQbMBZln9IGiFjBxDOPsELubhZMr9V2JBSSMyOnh16r2wLw9mjhDx3DW7H3A.rwFhi_cRepdMWhJ1oW94QzXKjE_XxDIN9pNB-bOvwpY&dib_tag=se&keywords=water%2Bbottle%2Btravel&qid=1744299629&sprefix=water%2Bbottle%2Btravel%2Caps%2C239&sr=8-7&th=1&linkCode=ll1&tag=googlementor-20&linkId=76a85aaebe2124769e4334342a2050ab&language=en_US&ref_=as_li_ss_tl',
  },
  {
    name: 'Herschel Travel Backpack',
    description: 'Carry your essentials in style.',
    image: '/assets/images/backpack.jpg',
    link: 'https://www.amazon.com/Herschel-Supply-Co-Classic-Backpack/dp/B0C3B2B5QC?crid=XHGDCIGAS3Q5&dib=eyJ2IjoiMSJ9.yzgIPLSG0TaOM6cd4W2QxICF3Q9VeZUsdfuixlsh90TGxGLOa48yyGOGeCGynfYMMdbA9IKkNWdlGiz2PN2E4uNQKplAyGpHR-GPry2p7nrS37-aCluEAb3Ka-xXAeTRZa3LaR89tQxEZb-c1pKBsf4vcQc7NDin1YN6rbi5gwD-utciZSKBOjDqPeE8CSESThvZs3MzGdpdqc5N4rx07qRiP-GtlzDCCBQIVMF4CxTFmVk576HAw3wI_N1zadBG15YEeu9KYL3yUh5fokSshiGnk35JdMFf4yiRoO3N8KY.SBSGQMtpVHXT2YBgLfe4K5jZqK8wl3T0yKbraO4wLtw&dib_tag=se&keywords=herschel+backpack&qid=1743775817&sprefix=hersha%2Caps%2C240&sr=8-16&linkCode=ll1&tag=googlementor-20&linkId=e705adfa7d7243a3169ec0954d19e508&language=en_US&ref_=as_li_ss_tl',
  },
  {
    name: 'Neck Pillow with Eye Mask',
    description: 'Travel in comfort.',
    image: '/assets/images/pillow.jpg',
    link: 'https://www.amazon.com/SARISUN-Airplanes-Sleeping-Headrest-Eligible/dp/B0CL6CXMGZ?crid=2ZDUSAIVFJXVZ&dib=eyJ2IjoiMSJ9.3CWiRROxnEI4OHZhXRORuV6t4MZZ8PuM9q4iAAHiZRNYXG_NNEpo600sMq_QMmO76GGIkyPxSVlua60cXx-j-JHMJdodaz9QBlUm9g4n7bgQq53w5VUIzQ-P79YuvSkvbkyH1HgXEUb4zVrILTmo3pZIDt9vTIMloKtvXE94Wg8u7Nq6ELgDozJvTdd8eINClmZQzJJLMYsWKYKew4bnS9kRXMX14QmN_d7LAEs_l_nfSAttvljAYVCwx4zXMHzxR7clbXjGzgEvFrEZLoOr8wM71YcvI7dfCFiqW0corlI.QRDM6UUBmY0eoQU6eD8lvJgCzAccQ0zV9i3AaSqnJpg&dib_tag=se&keywords=travel%2Bpillow&qid=1743776686&sprefix=travel%2Bpillow%2Caps%2C245&sr=8-15&th=1&linkCode=ll1&tag=googlementor-20&linkId=c9a286beb41d29e64da1d3363f6e2dc4&language=en_US&ref_=as_li_ss_tl',
  },
  {
    name: 'Face Sunscreen SPF 46',
    description: 'Protect your skin from the sun.',
    image: '/assets/images/sunscreen.jpg',
    link: 'https://www.amazon.com/EltaMD-Acne-Prone-Mineral-Based-Dermatologist-Recommended/dp/B002MSN3QQ?crid=3UG28XZY5PJ34&dib=eyJ2IjoiMSJ9.Dbjo2VW-q3VfGayePXsJQB9Q_56Gkm7QIxJf2Spbq-b0oZtyAkg-jWyCCYD9y18Z7HlyuNxuK34-4gK9fUOHi9vKQeGD774b-MMBdshsotuKXupSEMlJCgKeF6FAla0EO0lOIq46rFpx9_Y_cCxE1gOiCLyI9UxqspCDUqbI6XoLgGdtT-JUWVhIFS5ZUrsNfEG8qDRnXboxXzC0vmwkRO8rgWTLQcvlJ95kH3lMTv8EvTx-gHQ13zw54jjs6SDvRhfVbPf_46zTJhgTMyBQwTFbWbD_TmgKCxjJ3mdDBUU._MPaHe4J9mFqc_ro_c8C2Ntc9JoARqqTY5iGzE409xs&dib_tag=se&keywords=sun%2Bprotection&qid=1743777052&sprefix=sun%2Bprotection%2Caps%2C258&sr=8-1&th=1&linkCode=ll1&tag=googlementor-20&linkId=b8c9b3510de2c10944341d97c9e42ae5&language=en_US&ref_=as_li_ss_tl',
  },
  {
    name: 'Travel First Aid Kit',
    description: 'Be prepared for any situation.',
    image: '/assets/images/firstaid.jpg',
    link: 'https://www.amazon.com/Mini-First-Aid-Pieces-Small/dp/B0747N5KDM?crid=K9RBPL7QNW63&dib=eyJ2IjoiMSJ9.7V-Bnp2ksBXaSqzv_YBz1AzlgoEvZfMWn49iAke95Er6pjAbX39TdsQZXQf1Fr4OYkvJdY2nYfg7oonUw1hXykkB8kBynF9ekFdIYCmDPJ1gRiu_ZjgsTBRmSwsso_iKEMyycJAfRztCTugTV2swrqZ7LW7F84Kjj7eZDJ4OofTLTfdeHIwur4bOmlwGIfiM4ZyCXxV4URi66CdgwILCFaKJRpDaAh1J88lykEkcO7YqDEdhVy2FXc_pDjE6ntrfv3PEnW3Ap97fYkbi0GR1nlJ_DIYP3E2640bjvKC-PcU.1BigUDyXWY_Jgd6FG6et4V60cLFVnikqumP6qFIPyqU&dib_tag=se&keywords=first+aid+kit+travel&qid=1744300576&sprefix=first+aid%2Caps%2C238&sr=8-3&linkCode=ll1&tag=googlementor-20&linkId=4356bb842c872fece7e7d883afb71826&language=en_US&ref_=as_li_ss_tl',
  },
];

const Store: React.FC = () => {
  const [visibleProducts, setVisibleProducts] = useState(6);
  
  const handleViewMore = () => {
    setVisibleProducts((prev) => prev + 12);
  };
  return (
    <div id="store" className="bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl text-center">
          Travel Gifts
        </h2>
        <p className="mt-4 text-lg text-gray-600 text-center">
          Make your life easier.
        </p>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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