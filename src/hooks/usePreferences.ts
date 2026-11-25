import { useCallback, useEffect, useState } from 'react';

export type AppTheme = 'claude' | 'noir';
export type CodeSyntaxMode = 'colored' | 'monochrome';
export type ReadingDensity = 'comfortable' | 'compact';
export type AppLanguage = 'tr' | 'en';

export interface AppPreferences {
  language: AppLanguage;
  theme: AppTheme;
  codeSyntax: CodeSyntaxMode;
  density: ReadingDensity;
}

const PREFS_STORAGE_KEY = 'viacomponentis.prefs.v1';

const DEFAULT_PREFS: AppPreferences = {
  language: 'tr',
  theme: 'claude',
  codeSyntax: 'colored',
  density: 'comfortable',
};

function loadPreferences(): AppPreferences {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<AppPreferences>;
    return {
      language: parsed.language === 'en' ? 'en' : 'tr',
      theme: parsed.theme === 'noir' ? 'noir' : 'claude',
      codeSyntax: parsed.codeSyntax === 'monochrome' ? 'monochrome' : 'colored',
      density: parsed.density === 'compact' ? 'compact' : 'comfortable',
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<AppPreferences>(loadPreferences);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = prefs.language;
    root.setAttribute('data-theme', prefs.theme);
    root.setAttribute('data-code-syntax', prefs.codeSyntax);
    root.setAttribute('data-density', prefs.density);

    const bg = prefs.theme === 'noir' ? '#000000' : '#141413';
    root.style.backgroundColor = bg;
    document.body.style.backgroundColor = bg;

    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore storage write errors
    }
  }, [prefs]);

  const setLanguage = useCallback((language: AppLanguage) => {
    setPrefs((prev) => ({ ...prev, language }));
  }, []);

  const setTheme = useCallback((theme: AppTheme) => {
    setPrefs((prev) => ({ ...prev, theme }));
  }, []);

  const setCodeSyntax = useCallback((codeSyntax: CodeSyntaxMode) => {
    setPrefs((prev) => ({ ...prev, codeSyntax }));
  }, []);

  const setDensity = useCallback((density: ReadingDensity) => {
    setPrefs((prev) => ({ ...prev, density }));
  }, []);

  return {
    prefs,
    setLanguage,
    setTheme,
    setCodeSyntax,
    setDensity,
  };
}
