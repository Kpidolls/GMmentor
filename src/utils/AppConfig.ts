export const AppConfig = {
  site_name: 'Googlementor',
  title: 'Googlementor',
  description: 'Travel like a pro with Google Maps travel lists.',
  locale: 'en',
  baseUrl: process.env.NODE_ENV === 'production' ? 'https://googlementor.com/' : 'http://localhost:3000',
};