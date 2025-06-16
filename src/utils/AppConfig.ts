export const AppConfig = {
  site_name: 'Googlementor',
  title: 'Googlementor',
  description: 'Travel like a pro with location suggestions for your maps.',
  locale: 'en',
  baseUrl: process.env.NODE_ENV === 'production' ? 'https://googlementor.com/' : 'http://localhost:3000',
};