import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { useTranslation } from 'react-i18next';
import { metaDescriptions } from '../config/metaDescriptions';

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
const Terms = () => {
  const { t } = useTranslation();
  return (
    <div>
      <Head>
        <title>{t('meta.termsTitle', 'Terms and Conditions - Googlementor')}</title>
  <meta name="description" content={metaDescriptions.terms} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://googlementor.com/terms" />
      </Head>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">{t('termsPage.title', 'Terms and Conditions')}</h1>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">{t('termsPage.sections.access', '1. Access')}</h2>
        <p className="mb-4 text-gray-600">
          <strong>{t('termsPage.content.access.label', 'User Consent')}:</strong> {t('termsPage.content.access.text', "Welcome to Googlementor! These Terms of Use govern your access to and use of Googlementor's mapping services and shopping platform. By using our site, you agree to these terms. If you do not agree, please do not use our services.")}
        </p>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">{t('termsPage.sections.ageRequirements', '2. Age requirements')}</h2>
        <p className="mb-4 text-gray-600">
          <strong>{t('termsPage.content.ageRequirements.label', 'Data Protection Compliance')}:</strong> {t('termsPage.content.ageRequirements.text', 'By accessing or using Googlementor, you confirm that you are at least 18 years old or have the consent of a parent or guardian. If you are using the services on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.')}
        </p>
          <p className="mb-4 text-gray-600">
            {t('termsPage.content.platformIntro', 'Googlementor offers a platform for users to:')}
          </p>
          <ul className="list-disc list-inside mb-4 text-gray-600">
            <li>{t('termsPage.content.platformList.explore', 'Explore mapped locations for fun activities.')}</li>
            <li>{t('termsPage.content.platformList.purchase', 'Purchase custom maps.')}</li>
            <li>{t('termsPage.content.platformList.affiliate', 'Access affiliate products related to activities and locations.')}</li>
          </ul>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">{t('termsPage.sections.userAccounts', '3. User Accounts')}</h2>
          <p className="mb-4 text-gray-600">
            <strong>{t('termsPage.content.userAccounts.registrationLabel', 'Registration')}:</strong> {t('termsPage.content.userAccounts.registrationText', 'You may need to create an account to access certain features. You agree to provide accurate and complete information during registration.')}
          </p>
          <p className="mb-4 text-gray-600">
            <strong>{t('termsPage.content.userAccounts.securityLabel', 'Account Security')}:</strong> {t('termsPage.content.userAccounts.securityText', 'You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. Notify us immediately if you suspect any unauthorized use of your account.')}
          </p>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">{t('termsPage.sections.userConduct', '4. User Conduct')}</h2>
          <p className="mb-4 text-gray-600">
            {t('termsPage.content.userConduct.intro', 'You agree not to engage in any prohibited activities, including:')}
          </p>
          <ul className="list-disc list-inside mb-4 text-gray-600">
            <li>{t('termsPage.content.userConduct.list.unlawful', 'Using the service for any unlawful purpose or in violation of applicable laws.')}</li>
            <li>{t('termsPage.content.userConduct.list.impersonating', 'Impersonating any person or entity.')}</li>
            <li>{t('termsPage.content.userConduct.list.spam', 'Distributing unsolicited promotional material (spam).')}</li>
            <li>{t('termsPage.content.userConduct.list.harassing', 'Harassing or threatening other users.')}</li>
            <li>{t('termsPage.content.userConduct.list.interfering', 'Interfering with the security or performance of our services.')}</li>
          </ul>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">{t('termsPage.sections.contentOwnership', '5. Content Ownership')}</h2>
          <p className="mb-4 text-gray-600">
            <strong>{t('termsPage.content.contentOwnership.userLabel', 'User Content')}:</strong> {t('termsPage.content.contentOwnership.userText', 'You retain ownership of any content you submit through Googlementor (e.g., reviews, photos). By submitting content, you grant us a worldwide, non-exclusive license to use, reproduce, and distribute such content in connection with our services.')}
          </p>
          <p className="mb-4 text-gray-600">
            <strong>{t('termsPage.content.contentOwnership.platformLabel', 'Googlementor Content')}:</strong> {t('termsPage.content.contentOwnership.platformText', 'All content provided by Googlementor is owned by us or our licensors. You may not use any content without our express written permission.')}
          </p>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">{t('termsPage.sections.paymentTerms', '6. Payment Terms')}</h2>
          <p className="mb-4 text-gray-600">
            {t('termsPage.content.paymentTerms', 'Certain features may require payment. By providing payment information, you authorize us to charge your payment method for applicable fees. All payments are non-refundable unless otherwise specified.')}
          </p>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">{t('termsPage.sections.termination', '7. Termination')}</h2>
          <p className="mb-4 text-gray-600">
            {t('termsPage.content.termination', 'We reserve the right to suspend or terminate your access to Googlementor at our discretion if you violate these Terms or engage in harmful conduct.')}
          </p>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">{t('termsPage.sections.disclaimer', '8. Disclaimers and Limitation of Liability')}</h2>
          <p className="mb-4 text-gray-600">
            <strong>{t('termsPage.content.disclaimer.disclaimerLabel', 'Disclaimer')}:</strong> {t('termsPage.content.disclaimer.disclaimerText', 'Our services are provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free service.')}
          </p>
          <p className="mb-4 text-gray-600">
            <strong>{t('termsPage.content.disclaimer.limitationLabel', 'Limitation of Liability')}:</strong> {t('termsPage.content.disclaimer.limitationText', 'To the fullest extent permitted by law, Googlementor shall not be liable for any indirect, incidental, special, consequential damages arising from your use of our services.')}
          </p>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">{t('termsPage.sections.indemnification', '9. Indemnification')}</h2>
          <p className="mb-4 text-gray-600">
            {t('termsPage.content.indemnification', 'You agree to indemnify and hold harmless Googlementor and its affiliates from any claims, losses, liabilities, damages, costs, or expenses arising out of your use of our services or violation of these Terms.')}
          </p>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">{t('termsPage.sections.changes', '10. Changes to Terms')}</h2>
          <p className="mb-4 text-gray-600">
            {t('termsPage.content.changes', 'We may update these Terms from time to time. We will notify you about significant changes by posting a notice on our site or sending an email. Your continued use of the services after such changes constitutes acceptance of the new Terms.')}
          </p>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">{t('termsPage.sections.governingLaw', '11. Governing Law')}</h2>
          <p className="mb-4 text-gray-600">
            {t('termsPage.content.governingLaw', 'These Terms shall be governed by and construed in accordance with the laws of England and Wales, without regard to its conflict of law principles.')}
          </p>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">{t('termsPage.sections.contactUs', '12. Contact Us')}</h2>
          <p className="mb-4 text-gray-600">
            {t('termsPage.content.contactIntro', 'If you have any questions about these Terms of Use, please contact us at:')}
          </p>
          <p className="mb-4 text-gray-600">
            {t('termsPage.content.contactEmail', 'Email: mapsmentorinfo@gmail.com')}
          </p>
          <p className="mb-4 text-gray-600">
            {t('termsPage.content.contactAddress', 'Address: Fitzrovia House, 153 – 157 Cleveland Street, London W1T 6QW')}
          </p>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">{t('termsPage.sections.matcharisma', 'Terms for Promoting Matcharisma')}</h2>
          <p className="mb-4 text-gray-600">
            {t('termsPage.content.matcharisma.intro', 'To ensure effective promotion and integration between Googlementor and Matcharisma while adhering to ethical standards:')}
          </p>
          <p className="mb-4 text-gray-600">
            <strong>{t('termsPage.content.matcharisma.transparencyLabel', 'Transparency in Promotion')}:</strong> {t('termsPage.content.matcharisma.transparencyText', 'All promotional materials must clearly indicate that they are sponsored by or affiliated with the parent company owning both platforms (e.g., "Promotion brought to you by Parent Company, owner of Matcharisma").')}
          </p>
          <p className="mb-4 text-gray-600">
            <strong>{t('termsPage.content.matcharisma.userConsentLabel', 'User Consent')}:</strong> {t('termsPage.content.matcharisma.userConsentText', "Obtain explicit user consent before collecting any data specifically related to promoting Matcharisma services within Googlementor's ecosystem.")}
          </p>
          <p className="mb-4 text-gray-600">
            <strong>{t('termsPage.content.matcharisma.dataProtectionLabel', 'Data Protection Compliance')}:</strong> {t('termsPage.content.matcharisma.dataProtectionText', 'Comply fully with relevant privacy regulations such as GDPR and other applicable laws regarding data protection and user privacy.')}
          </p>
        <p className="mb-4 text-gray-600">
          {t('termsPage.content.conclusion', 'By using Googlementor, you acknowledge that you have read these Terms and agree to be bound by them. Thank you for being part of our community!')}
        </p>
        <Link href="/" className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors duration-300">
          {t('termsPage.returnHome', 'Return to Home')}
        </Link>
      </div>
    </div>
  );
};

export default Terms;