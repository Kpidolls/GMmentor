// hooks/usePersistedLanguage.ts
import { useEffect } from 'react';
import i18n from '../i18n';

const usePersistedLanguage = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLang = localStorage.getItem('language');
      if (storedLang && i18n.language !== storedLang) {
        i18n.changeLanguage(storedLang);
      }
    }
  }, []);
};

export default usePersistedLanguage;
