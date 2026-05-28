import React from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { FaFacebook } from 'react-icons/fa';
// import { FaTwitter } from 'react-icons/fa';
// import { FaTiktok } from 'react-icons/fa';
import { FaInstagram } from 'react-icons/fa';
import featureFlags from '../config/featureFlags.json';

const About = () => {
  const { t } = useTranslation();
  const contactEmailRaw = t('about.contactEmail', 'contact@example.com');
  const contactEmail = contactEmailRaw.replace(/^.*?:\s*/, '').trim();

  const links = [
    // { key: 'affiliatePartners', href: '/login', label: t('about.affiliatePartners', 'Affiliate Partners') },
    { key: 'mobileDataEsim', href: '/airalo', label: t('about.mobileDataEsim', 'Mobile Data - eSIM') },
    { key: 'travelInsurance', href: '/insurance', label: t('about.travelInsurance', 'Travel Insurance') },
    { key: 'privacyPolicy', href: '/privacy-policy', label: t('about.privacyPolicy', 'Privacy Policy') },
    { key: 'termsOfService', href: '/terms', label: t('about.termsOfService', 'Terms of Service') },
    { key: 'contact', href: `mailto:${contactEmail}`, label: t('about.contactUs', 'Contact') },
  ];
  const footerLinks = featureFlags.storeEnabled
    ? [...links, { key: 'products', href: '/store', label: t('about.products', 'Products') }]
    : links;

  const socialLinks = [
    { href: t('about.facebook', '#'), icon: FaFacebook, platform: 'Facebook' },
    // { href: t('about.twitter', '#'), icon: FaTwitter, platform: 'Twitter' },
    // { href: t('about.tiktok', '#'), icon: FaTiktok, platform: 'TikTok' },
    { href: t('about.instagram', '#'), icon: FaInstagram, platform: 'Instagram' },
  ];

  return (
    <footer id="footer" className="mt-12 border-t border-slate-700/70 bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9 sm:py-12">
        <div className="mb-6 pb-4 sm:mb-8 sm:pb-6 border-b border-slate-800">
          <h2 className="text-lg sm:text-xl font-primary font-bold tracking-tight text-white">Googlementor</h2>
          <p className="mt-1.5 sm:mt-2 text-[13px] sm:text-sm leading-snug sm:leading-normal font-secondary text-slate-300 max-w-xl sm:max-w-2xl">
            Curated places, practical travel tools, and trusted guides for exploring Greece with confidence.
          </p>
        </div>

        <div className={`grid grid-cols-1 ${featureFlags.buyMeCoffeeEnabled ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6 sm:gap-8`}>
          {/* Links Section */}
          <section className="space-y-3 sm:space-y-4">
            <h3 className="text-xs font-bold font-primary uppercase tracking-[0.14em] text-slate-400">{t('about.linksTitle', 'Quick Links')}</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-y-1.5 sm:gap-y-2 gap-x-4">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith('mailto:') ? (
                    <a
                      href={link.href}
                      className="inline-block text-[13px] sm:text-sm leading-tight font-secondary text-slate-200 hover:text-white transition-colors duration-200"
                      aria-label={t('aria.navigateTo', { label: link.label, defaultValue: 'Navigate to {{label}}' })}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="inline-block text-[13px] sm:text-sm leading-tight font-secondary text-slate-200 hover:text-white transition-colors duration-200"
                      aria-label={t('aria.navigateTo', { label: link.label, defaultValue: 'Navigate to {{label}}' })}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* Social Media Section */}
          <section className="space-y-3 sm:space-y-4">
            <h3 className="text-xs font-bold font-primary uppercase tracking-[0.14em] text-slate-400">{t('about.followUs', 'Follow Us')}</h3>
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.platform}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white transition duration-200"
                  aria-label={t('about.followUsOn', { platform: social.platform })}
                >
                  <social.icon className="text-base sm:text-lg" />
                </a>
              ))}
            </div>
          </section>

          {featureFlags.buyMeCoffeeEnabled && (
            <section className="space-y-3 sm:space-y-4">
              <h3 className="text-xs font-bold font-primary uppercase tracking-[0.14em] text-slate-400">{t('about.supportUs', 'Support Us')}</h3>
              <p className="text-[13px] sm:text-sm leading-snug sm:leading-relaxed font-secondary text-slate-300 max-w-[30ch] sm:max-w-none">
                {t('about.supportUsDescription', 'Support our mission by contributing to our platform.')}
              </p>
              <a
                href={t('about.supportUsLink', '#')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md px-3.5 sm:px-4 py-1.5 sm:py-2 text-[13px] sm:text-sm font-semibold font-secondary bg-amber-400 text-slate-900 hover:bg-amber-300 transition-colors duration-200"
                aria-label={t('about.supportUsAria', 'Support us by buying a coffee')}
              >
                {t('about.buyMeCoffee', 'Buy Me a Coffee')}
              </a>
            </section>
          )}

          {/* Contact Section */}
          <section className="space-y-3 sm:space-y-4">
            <h3 className="text-xs font-bold font-primary uppercase tracking-[0.14em] text-slate-400">{t('about.contactUs', 'Contact Us')}</h3>
            <a
              href={`mailto:${contactEmail}`}
              className="inline-block text-[13px] sm:text-sm leading-tight font-secondary text-slate-200 hover:text-white transition-colors duration-200 break-all sm:break-normal"
              aria-label={t('aria.navigateTo', { label: t('about.contactUs', 'Contact Us'), defaultValue: 'Navigate to {{label}}' })}
            >
              {contactEmail}
            </a>
            <p className="text-xs leading-snug font-secondary text-slate-400 max-w-[34ch] sm:max-w-none">
              {t('about.mapsData', 'All maps and data are provided as is.')}
            </p>
          </section>
        </div>

        {/* Footer Bottom Section */}
        <div className="mt-7 sm:mt-10 pt-4 sm:pt-5 border-t border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-3 text-slate-400">
          <p className="text-xs font-secondary">
            &copy; {new Date().getFullYear()} {t('about.copyright')}
          </p>
          <Link
            href="https://github.com/issaafalkattan/react-landing-page-template-2021"
            className="text-xs font-secondary text-slate-500 hover:text-slate-300 transition-colors duration-200"
            aria-label={t('aria.visitTemplateRepository', 'Visit the original template repository')}
          >
            Template Credits: I. Kattan
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default About;
