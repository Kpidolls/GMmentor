import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const usePersistedLanguage = () => {
  const { i18n } = useTranslation();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize language from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Only run once after i18n is ready
    if (!isInitialized && i18n.isInitialized) {
      const savedLanguage = localStorage.getItem('language');
      const browserLanguage = navigator.language?.split('-')[0] || 'en';
      const defaultLanguage = savedLanguage || (browserLanguage === 'el' ? 'el' : 'en');

      if (i18n.language !== defaultLanguage) {
        i18n.changeLanguage(defaultLanguage);
      }

      setIsInitialized(true);
    }
  }, [i18n.isInitialized, isInitialized, i18n]);

  // Persist language changes
  useEffect(() => {
    if (!i18n.isInitialized) return;

    const handler = (lng: string) => {
      localStorage.setItem('language', lng);
    };

    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
};

export default usePersistedLanguage;
