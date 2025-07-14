import { createContext } from 'react';

export type TranslationsContextType = {
  useTranslations: boolean;
  getCurrentLanguage: () => string;
};

const context = createContext<TranslationsContextType>({
  useTranslations: false,
  getCurrentLanguage: () => '',
});

export default context;