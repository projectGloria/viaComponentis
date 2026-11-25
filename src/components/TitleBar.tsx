import { useEffect, useRef, useState } from 'react';
import { Copy, Minus, SlidersHorizontal, Sparkles, Square, X } from 'lucide-react';
import { UI_STRINGS } from '../data/uiStrings';
import type {
  AppLanguage,
  AppTheme,
  CodeSyntaxMode,
  ReadingDensity,
} from '../hooks/usePreferences';
import {
  closeWindow,
  isWindowMaximized,
  minimizeWindow,
  onWindowResized,
  toggleMaximizeWindow,
} from '../lib/tauriWindow';

interface TitleBarProps {
  activeContextLabel: string;
  language: AppLanguage;
  theme: AppTheme;
  codeSyntax: CodeSyntaxMode;
  density: ReadingDensity;
  onSetLanguage: (language: AppLanguage) => void;
  onSetTheme: (theme: AppTheme) => void;
  onSetCodeSyntax: (mode: CodeSyntaxMode) => void;
  onSetDensity: (density: ReadingDensity) => void;
  onReplaySplash: () => void;
}

export function TitleBar({
  activeContextLabel,
  language,
  theme,
  codeSyntax,
  density,
  onSetLanguage,
  onSetTheme,
  onSetCodeSyntax,
  onSetDensity,
  onReplaySplash,
}: TitleBarProps) {
  const [maximized, setMaximized] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const optionsBtnRef = useRef<HTMLButtonElement>(null);
  const t = UI_STRINGS[language].titleBar;

  useEffect(() => {
    let active = true;
    let unlisten: (() => void) | undefined;

    isWindowMaximized().then((m) => {
      if (active) setMaximized(m);
    });

    onWindowResized((m) => {
      if (active) setMaximized(m);
    }).then((fn) => {
      if (active) unlisten = fn;
      else fn();
    });

    return () => {
      active = false;
      unlisten?.();
    };
  }, []);

  useEffect(() => {
    if (!optionsOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        optionsRef.current?.contains(target) ||
        optionsBtnRef.current?.contains(target)
      ) {
        return;
      }
      setOptionsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOptionsOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [optionsOpen]);

  const handleToggleMaximize = async () => {
    const next = await toggleMaximizeWindow();
    setMaximized(next);
  };

  return (
    <header className="titlebar">
      <div
        className="titlebar-left"
        data-tauri-drag-region
        onDoubleClick={handleToggleMaximize}
      >
        <div className="titlebar-brand" data-tauri-drag-region>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <polygon
              points="12,2 22,12 12,22 2,12"
              stroke="var(--accent)"
              strokeWidth="1.7"
            />
            <circle cx="12" cy="12" r="3" fill="var(--accent)" />
          </svg>
          <span data-tauri-drag-region>REACT // ROADMAP OS</span>
        </div>
        <span className="titlebar-version" data-tauri-drag-region>
          v0.1.0
        </span>
        <span className="titlebar-context" data-tauri-drag-region>
          {activeContextLabel}
        </span>
      </div>

      <div className="titlebar-actions">
        <button
          ref={optionsBtnRef}
          type="button"
          className={`titlebar-btn ${optionsOpen ? 'titlebar-btn--active' : ''}`}
          title={t.optionsTitle}
          aria-label={t.optionsTitle}
          aria-expanded={optionsOpen}
          onClick={() => setOptionsOpen((open) => !open)}
        >
          <SlidersHorizontal size={14} />
        </button>

        <button
          type="button"
          className="titlebar-btn"
          title={t.replaySplashTitle}
          aria-label={t.replaySplashTitle}
          onClick={onReplaySplash}
        >
          <Sparkles size={14} />
        </button>

        <button
          type="button"
          className="titlebar-btn"
          title={t.minimizeTitle}
          aria-label={t.minimizeTitle}
          onClick={() => void minimizeWindow()}
        >
          <Minus size={14} />
        </button>

        <button
          type="button"
          className="titlebar-btn"
          title={maximized ? t.restoreTitle : t.maximizeTitle}
          aria-label={maximized ? t.restoreTitle : t.maximizeTitle}
          onClick={() => void handleToggleMaximize()}
        >
          {maximized ? <Copy size={12} /> : <Square size={12} />}
        </button>

        <button
          type="button"
          className="titlebar-btn titlebar-btn--close"
          title={t.closeTitle}
          aria-label={t.closeTitle}
          onClick={() => void closeWindow()}
        >
          <X size={14} />
        </button>

        {optionsOpen ? (
          <div
            ref={optionsRef}
            className="options-popover"
            role="dialog"
            aria-label={t.optionsTitle}
          >
            <div className="options-group">
              <span className="options-label">{t.languageLabel}</span>
              <div className="options-segment">
                <button
                  type="button"
                  className={`cyber-btn cyber-btn--sm ${
                    language === 'tr' ? 'cyber-btn--primary' : ''
                  }`}
                  onClick={() => onSetLanguage('tr')}
                >
                  {t.turkishBtn}
                </button>
                <button
                  type="button"
                  className={`cyber-btn cyber-btn--sm ${
                    language === 'en' ? 'cyber-btn--primary' : ''
                  }`}
                  onClick={() => onSetLanguage('en')}
                >
                  {t.englishBtn}
                </button>
              </div>
            </div>

            <div className="options-group">
              <span className="options-label">{t.themeLabel}</span>
              <div className="options-segment">
                <button
                  type="button"
                  className={`cyber-btn cyber-btn--sm ${
                    theme === 'claude' ? 'cyber-btn--primary' : ''
                  }`}
                  onClick={() => onSetTheme('claude')}
                >
                  {t.claudeThemeBtn}
                </button>
                <button
                  type="button"
                  className={`cyber-btn cyber-btn--sm ${
                    theme === 'noir' ? 'cyber-btn--primary' : ''
                  }`}
                  onClick={() => onSetTheme('noir')}
                >
                  {t.noirThemeBtn}
                </button>
              </div>
            </div>

            <div className="options-group">
              <span className="options-label">{t.codeSyntaxLabel}</span>
              <div className="options-segment">
                <button
                  type="button"
                  className={`cyber-btn cyber-btn--sm ${
                    codeSyntax === 'colored' ? 'cyber-btn--primary' : ''
                  }`}
                  onClick={() => onSetCodeSyntax('colored')}
                >
                  {t.coloredBtn}
                </button>
                <button
                  type="button"
                  className={`cyber-btn cyber-btn--sm ${
                    codeSyntax === 'monochrome' ? 'cyber-btn--primary' : ''
                  }`}
                  onClick={() => onSetCodeSyntax('monochrome')}
                >
                  {t.monoBtn}
                </button>
              </div>
            </div>

            <div className="options-group">
              <span className="options-label">{t.densityLabel}</span>
              <div className="options-segment">
                <button
                  type="button"
                  className={`cyber-btn cyber-btn--sm ${
                    density === 'comfortable' ? 'cyber-btn--primary' : ''
                  }`}
                  onClick={() => onSetDensity('comfortable')}
                >
                  {t.comfortBtn}
                </button>
                <button
                  type="button"
                  className={`cyber-btn cyber-btn--sm ${
                    density === 'compact' ? 'cyber-btn--primary' : ''
                  }`}
                  onClick={() => onSetDensity('compact')}
                >
                  {t.compactBtn}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
