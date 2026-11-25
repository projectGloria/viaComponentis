import { useRef, useState, type ChangeEvent } from 'react';
import { Download, RotateCcw, Upload } from 'lucide-react';
import type { RoadmapSection, TopicStatus } from '../data/types';
import { UI_STRINGS } from '../data/uiStrings';
import type { AppLanguage } from '../hooks/usePreferences';
import type { RankTitle } from '../hooks/useRoadmapStore';
import { CharacterRig } from './CharacterRig';

interface SidebarProps {
  language: AppLanguage;
  sections: RoadmapSection[];
  activeSectionId: string;
  getStatus: (topicId: string) => TopicStatus;
  masteredCount: number;
  totalTopics: number;
  completionPct: number;
  rank: RankTitle;
  celebratePulse: number;
  onJumpToSection: (sectionId: string) => void;
  onExport: () => void;
  onImport: (jsonText: string) => void;
  onReset: () => void;
}

export function Sidebar({
  language,
  sections,
  activeSectionId,
  getStatus,
  masteredCount,
  totalTopics,
  completionPct,
  rank,
  celebratePulse,
  onJumpToSection,
  onExport,
  onImport,
  onReset,
}: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const t = UI_STRINGS[language].sidebar;

  const handleImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    onImport(text);
    e.target.value = '';
  };

  return (
    <aside className="sidebar" aria-label="Neural Roadmap Navigation">
      {/* Top — Section Jump Nav */}
      <div>
        <div className="sidebar-section-label">
          <span>{t.modulesHeader}</span>
          <span>
            {sections.length} {t.sectionsCountSuffix}
          </span>
        </div>
        <nav className="sidebar-nav">
          {sections.map((section) => {
            const done = section.topics.filter((topic) => getStatus(topic.id) === 'mastered').length;
            const total = section.topics.length;
            const isActive = activeSectionId === section.id;
            const allDone = done === total && total > 0;

            return (
              <button
                key={section.id}
                type="button"
                className={`sidebar-nav-item ${isActive ? 'sidebar-nav-item--active' : ''}`}
                onClick={() => onJumpToSection(section.id)}
              >
                <span className="sidebar-nav-left">
                  <span className="sidebar-nav-idx">{section.index}</span>
                  <span className="sidebar-nav-title">{section.title}</span>
                </span>
                <span className={`sidebar-nav-count ${allDone ? 'sidebar-nav-count--done' : ''}`}>
                  {done}/{total}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Middle — Large Full-Body Character Showcase */}
      <div className="sidebar-rig-stage">
        <CharacterRig size="sidebar" celebratePulse={celebratePulse} />
      </div>

      {/* Bottom — Neural Mastery Telemetry Card */}
      <div className="hud-card telemetry-card">
        <div className="telemetry-row">
          <span className="telemetry-label">{t.masteredLabel}</span>
          <span className="telemetry-value">
            {masteredCount} / {totalTopics} ({completionPct}%)
          </span>
        </div>

        <div className="telemetry-bar-track" aria-label={t.masteredLabel}>
          <div className="telemetry-bar-fill" style={{ width: `${completionPct}%` }} />
        </div>

        <div className="telemetry-rank">
          <span className="telemetry-label">{t.clearanceLabel}</span>
          <span className="telemetry-rank-badge">{t.ranks[rank]}</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={(e) => void handleImportFile(e)}
        />

        {confirmReset ? (
          <div className="telemetry-controls">
            <button
              type="button"
              className="cyber-btn cyber-btn--primary cyber-btn--sm"
              onClick={() => {
                onReset();
                setConfirmReset(false);
              }}
            >
              {t.confirmWipe}
            </button>
            <button
              type="button"
              className="cyber-btn cyber-btn--sm"
              onClick={() => setConfirmReset(false)}
            >
              {t.cancel}
            </button>
          </div>
        ) : (
          <div className="telemetry-controls">
            <button
              type="button"
              className="cyber-btn cyber-btn--sm"
              title={t.exportTitle}
              onClick={onExport}
            >
              <Download size={11} />
              <span>{t.exportBtn}</span>
            </button>
            <button
              type="button"
              className="cyber-btn cyber-btn--sm"
              title={t.importTitle}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={11} />
              <span>{t.importBtn}</span>
            </button>
            <button
              type="button"
              className="cyber-btn cyber-btn--sm"
              title={t.resetTitle}
              onClick={() => setConfirmReset(true)}
            >
              <RotateCcw size={11} />
              <span>{t.resetBtn}</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
