import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaTiktok, FaInstagram } from 'react-icons/fa';

const About = () => {
  const { t } = useTranslation();

  return (
    <footer id="footer" className="bg-gray-800 text-white py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Links Section */}
          <div>
            <h3 className="text-lg font-bold font-primary mb-4">{t('about.linksTitle')}</h3>
            <ul className="text-gray-400 space-y-2">
              {[
                { href: '/login', label: t('about.affiliatePartners') },
                { href: '/login', label: t('about.mapCreators') },
                { href: '#store', label: t('about.products') },
                { href: '/insurance', label: t('about.travelInsurance') },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-200 font-secondary hover:text-white transition duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media Section */}
          <div>
            <h3 className="text-lg font-bold font-primary mb-4">{t('about.followUs')}</h3>
            <div className="flex space-x-4">
              {[
                { href: t('about.facebook'), icon: FaFacebook, platform: 'Facebook' },
                { href: t('about.twitter'), icon: FaTwitter, platform: 'Twitter' },
                { href: t('about.tiktok'), icon: FaTiktok, platform: 'TikTok' },
                { href: t('about.instagram'), icon: FaInstagram, platform: 'Instagram' },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('about.followUsOn', { platform: social.platform })}
                >
                  <social.icon className="text-2xl text-gray-400 hover:text-white transition duration-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Support Us Section */}
          <div>
            <h3 className="text-lg font-bold font-primary mb-4">{t('about.supportUs')}</h3>
            <p className="text-gray-400 font-secondary">{t('about.supportUsDescription')}</p>
            <a
              href={t('about.supportUsLink')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-6 py-2 font-secondary bg-yellow-500 text-gray-900 font-semibold rounded hover:bg-yellow-600 transition duration-300"
              aria-label={t('about.supportUsAria')}
            >
              {t('about.buyMeCoffee')}
            </a>
          </div>

          {/* Contact Us Section */}
          <div>
            <h3 className="text-lg font-bold font-primary mb-4">{t('about.contactUs')}</h3>
            <p className="text-gray-400 font-secondary">{t('about.contactEmail')}</p>
            <p className="text-gray-400 font-secondary mt-1">
              <Trans
                i18nKey="about.contactTerms"
                components={{
                  terms: (
                    <Link
                      href="/terms"
                      className="text-gray-200 underline hover:text-white transition duration-300"
                    />
                  ),
                  privacy: (
                    <Link
                      href="/privacy-policy"
                      className="text-gray-200 underline hover:text-white transition duration-300"
                    />
                  ),
                }}
              />
            </p>
          </div>
        </div>

        {/* Footer Bottom Section */}
        <div className="mt-8 border-t border-gray-700 pt-4 text-center text-gray-400">
          <p className="text-xs font-secondary lg:text-sm">{t('about.mapsData')}</p>
          <p className="mt-4 font-secondary">

            &copy; {new Date().getFullYear()} {t('about.copyright')} 
            <Link
            href="https://github.com/issaafalkattan/react-landing-page-template-2021"
            className="text-gray-700 underline hover:text-white transition duration-300"
            > 
            I. Kattan.
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default About;
