import { useCallback, useEffect, useState } from 'react';
import { UI_STRINGS } from '../data/uiStrings';
import type { AppLanguage } from '../hooks/usePreferences';
import { CharacterRig } from './CharacterRig';

interface SplashScreenProps {
  language: AppLanguage;
  masteredCount: number;
  totalTopics: number;
  onComplete: () => void;
}

export function SplashScreen({
  language,
  masteredCount,
  totalTopics,
  onComplete,
}: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const t = UI_STRINGS[language].splash;

  const dismiss = useCallback(() => {
    setExiting((already) => {
      if (already) return true;
      window.setTimeout(onComplete, 450);
      return true;
    });
  }, [onComplete]);

  useEffect(() => {
    const start = performance.now();
    const duration = 2000;
    let rafId = 0;

    const tick = (now: number) => {
      const pct = Math.min(100, Math.round(((now - start) / duration) * 100));
      setProgress(pct);
      if (pct < 100) {
        rafId = requestAnimationFrame(tick);
      } else {
        window.setTimeout(dismiss, 240);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [dismiss]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        dismiss();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dismiss]);

  return (
    <div
      className={`splash-overlay ${exiting ? 'splash-overlay--exiting' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="viaComponentis Boot Sequence"
    >
      {/* Top Drag Strip & Corner HUD Telemetry */}
      <div className="splash-drag-strip" data-tauri-drag-region>
        <span>{t.sysHeader}</span>
        <span>{t.masteryHeader(masteredCount, totalTopics)}</span>
      </div>

      {/* Center Levitating Holographic Rig + Laser Scan + Glitch Title */}
      <div className="splash-center">
        <div className="splash-rig-wrap">
          <CharacterRig size="splash" />
          <div className="splash-laser-beam" aria-hidden="true" />
        </div>

        <h1 className="splash-glitch-title" data-text={t.title}>
          {t.title}
        </h1>

        <div className="hud-card hud-card--elevated splash-boot-panel">
          <div className="splash-log-lines">
            {t.bootLogs.map((entry) => {
              const visible = progress >= entry.threshold;
              return (
                <div
                  key={entry.label}
                  className="splash-log-line"
                  style={{ opacity: visible ? 1 : 0.22 }}
                >
                  <span>&gt; {entry.label}</span>
                  <span className="splash-log-ok">{visible ? `[${entry.status}]` : '[WAIT]'}</span>
                </div>
              );
            })}
          </div>

          <div className="splash-progress-track" aria-label="Boot Progress">
            <div className="splash-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginTop: '4px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-muted)',
              }}
            >
              {t.bootSeqPrefix} :: {progress}%
            </span>
            <button
              type="button"
              className="cyber-btn cyber-btn--primary"
              onClick={dismiss}
              autoFocus
            >
              {t.enterBtn}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Corner Telemetry */}
      <div className="splash-footer">
        <span>VIACOMPONENTIS v0.1.0</span>
        <span>{t.bypassHint}</span>
      </div>
    </div>
  );
}
