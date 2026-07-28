import React, { createContext, useContext, useMemo, useState } from 'react';
import { translations, type Language, type TranslationKey } from './translations';

/**
 * Lightweight i18n. Default language is Greek. Later, the choice can be
 * persisted (AsyncStorage) and synced to the user's Supabase profile.
 */

type I18nValue = {
  language: Language;
  /** BCP-47 locale for date formatting */
  locale: string;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
};

const LanguageContext = createContext<I18nValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('el');

  const value = useMemo<I18nValue>(
    () => ({
      language,
      locale: language === 'el' ? 'el-GR' : 'en-GB',
      setLanguage,
      t: (key, params) => {
        let text: string = translations[language][key] ?? key;
        if (params) {
          for (const [name, val] of Object.entries(params)) {
            text = text.replace(`{${name}}`, val);
          }
        }
        return text;
      },
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useI18n must be used inside a <LanguageProvider>');
  }
  return ctx;
}
