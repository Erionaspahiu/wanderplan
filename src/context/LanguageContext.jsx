import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "../i18n";

const LanguageContext = createContext(null);
const STORAGE_KEY = "movin_lang";

function getInitialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && translations[saved]) return saved;
  } catch {
    // localStorage unavailable — fall back to default
  }
  return "en";
}

function resolve(dict, key) {
  return key.split(".").reduce((acc, part) => (acc == null ? acc : acc[part]), dict);
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // localStorage unavailable — language choice just won't persist
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next) => {
    if (translations[next]) setLangState(next);
  }, []);

  const t = useCallback(
    (key, vars) => {
      if (!key) return "";
      let str = resolve(translations[lang], key) ?? resolve(translations.en, key) ?? key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          str = str.replaceAll(`{{${k}}}`, v);
        });
      }
      return str;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
