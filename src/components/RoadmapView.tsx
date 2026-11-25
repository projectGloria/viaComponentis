import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Check, Circle, Clock, Play, Search } from 'lucide-react';
import type { RoadmapSection, TopicStatus } from '../data/types';
import { UI_STRINGS } from '../data/uiStrings';
import type { AppLanguage } from '../hooks/usePreferences';
import { cycleStatus } from '../hooks/useRoadmapStore';

export type StatusFilter = 'all' | 'remaining' | 'in_progress' | 'mastered';

interface RoadmapViewProps {
  language: AppLanguage;
  sections: RoadmapSection[];
  getStatus: (topicId: string) => TopicStatus;
  totalTopics: number;
  masteredCount: number;
  inProgressCount: number;
  completionPct: number;
  scrollTargetSection: { id: string; seq: number } | null;
  onActiveSectionChange: (sectionId: string) => void;
  onOpenTopic: (topicId: string) => void;
  onSetStatus: (topicId: string, status: TopicStatus) => void;
}

export function RoadmapView({
  language,
  sections,
  getStatus,
  totalTopics,
  masteredCount,
  inProgressCount,
  completionPct,
  scrollTargetSection,
  onActiveSectionChange,
  onOpenTopic,
  onSetStatus,
}: RoadmapViewProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const t = UI_STRINGS[language].roadmap;

  const filterOptions: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: t.filters.all },
    { id: 'remaining', label: t.filters.remaining },
    { id: 'in_progress', label: t.filters.in_progress },
    { id: 'mastered', label: t.filters.mastered },
  ];

  // Scroll to section requested by Sidebar Jump Nav
  useEffect(() => {
    if (!scrollTargetSection) return;
    const el = sectionRefs.current[scrollTargetSection.id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [scrollTargetSection]);

  // Update active section indicator in Sidebar while scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-section-id');
            if (id) onActiveSectionChange(id);
          }
        }
      },
      { rootMargin: '-18% 0px -65% 0px', threshold: 0.05 }
    );

    for (const section of sections) {
      const el = sectionRefs.current[section.id];
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [filter, onActiveSectionChange, query, sections]);

  const filteredSections = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return sections
      .map((section) => {
        const matchingTopics = section.topics.filter((topic) => {
          const status = getStatus(topic.id);
          if (filter === 'remaining' && status === 'mastered') return false;
          if (filter === 'in_progress' && status !== 'in_progress') return false;
          if (filter === 'mastered' && status !== 'mastered') return false;

          if (!normalized) return true;
          return (
            topic.title.toLowerCase().includes(normalized) ||
            topic.summary.toLowerCase().includes(normalized) ||
            topic.index.toLowerCase().includes(normalized) ||
            topic.tags.some((tag) => tag.toLowerCase().includes(normalized))
          );
        });

        return { section, topics: matchingTopics };
      })
      .filter((entry) => entry.topics.length > 0);
  }, [filter, getStatus, query, sections]);

  return (
    <div className="roadmap-container">
      {/* Compact KPI Strip */}
      <div className="kpi-strip">
        <div className="hud-card kpi-tile">
          <span className="kpi-label">{t.kpiTotal}</span>
          <span className="kpi-number">{totalTopics}</span>
          <span className="kpi-sub">{t.kpiTotalSub(sections.length)}</span>
        </div>
        <div className="hud-card kpi-tile">
          <span className="kpi-label">{t.kpiMastered}</span>
          <span className="kpi-number">{masteredCount}</span>
          <span className="kpi-sub">{t.kpiMasteredSub}</span>
        </div>
        <div className="hud-card kpi-tile">
          <span className="kpi-label">{t.kpiInProgress}</span>
          <span className="kpi-number">{inProgressCount}</span>
          <span className="kpi-sub">{t.kpiInProgressSub}</span>
        </div>
        <div className="hud-card kpi-tile">
          <span className="kpi-label">{t.kpiCompletion}</span>
          <span className="kpi-number">{completionPct}%</span>
          <span className="kpi-sub">{t.kpiCompletionSub}</span>
        </div>
      </div>

      {/* Search & Status Filter Pills */}
      <div className="roadmap-toolbar">
        <div className="search-box">
          <Search size={14} className="search-icon" />
          <input
            type="search"
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchPlaceholder}
          />
        </div>

        <div className="filter-pills" role="group" aria-label="Status filters">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`cyber-pill ${filter === opt.id ? 'cyber-pill--active' : ''}`}
              onClick={() => setFilter(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vertical Connected Node Graph */}
      {filteredSections.length === 0 ? (
        <div className="hud-card" style={{ padding: '28px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
            {t.emptySearch}
          </p>
        </div>
      ) : (
        filteredSections.map(({ section, topics }) => {
          const sectionMastered = section.topics.filter(
            (topic) => getStatus(topic.id) === 'mastered'
          ).length;
          const sectionAllDone = sectionMastered === section.topics.length;

          return (
            <section
              key={section.id}
              ref={(el) => {
                sectionRefs.current[section.id] = el;
              }}
              data-section-id={section.id}
              className="roadmap-section"
            >
              <div className="section-divider">
                <span className="section-divider-line section-divider-line--left" />
                <h2 className="section-divider-title">
                  {section.index} // {section.title}
                </h2>
                <span
                  className={`section-divider-badge ${
                    sectionAllDone ? 'section-divider-badge--done' : ''
                  }`}
                >
                  {t.sectionMasteredBadge(sectionMastered, section.topics.length)}
                </span>
                <span className="section-divider-line" />
              </div>

              <p className="section-subtitle">{section.subtitle}</p>

              <div className="node-stack">
                {topics.map((topic, idx) => {
                  const status = getStatus(topic.id);
                  const prevTopic = idx > 0 ? topics[idx - 1] : null;
                  const prevMastered = prevTopic ? getStatus(prevTopic.id) === 'mastered' : false;
                  const energized = prevMastered && status === 'mastered';
                  const activeConduit = prevMastered && status !== 'queued';

                  return (
                    <div key={topic.id}>
                      {idx > 0 ? (
                        <div
                          className={`node-connector ${
                            activeConduit ? 'node-connector--energized' : ''
                          }`}
                          aria-hidden="true"
                        >
                          {energized ? <span className="node-connector-pulse" /> : null}
                        </div>
                      ) : null}

                      <article
                        className={`hud-card topic-node topic-node--${status}`}
                        onClick={() => onOpenTopic(topic.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onOpenTopic(topic.id);
                          }
                        }}
                      >
                        <div className="topic-node-main">
                          <div className="topic-node-header">
                            <span className="topic-index">{topic.index}</span>
                            <h3 className="topic-title" style={{ margin: 0 }}>
                              {topic.title}
                            </h3>
                          </div>

                          <p className="topic-summary" style={{ margin: 0 }}>
                            {topic.summary}
                          </p>

                          <div className="topic-meta-row">
                            <span className="meta-chip">
                              <Clock
                                size={9}
                                style={{ verticalAlign: 'middle', marginRight: '4px' }}
                              />
                              {topic.estimatedMinutes}
                              {t.minuteSuffix}
                            </span>
                            <span className="meta-chip">
                              {t.difficultyLabels[topic.difficulty]}
                            </span>
                            {topic.tags.map((tag) => (
                              <span key={tag} className="meta-chip">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="topic-node-actions">
                          <button
                            type="button"
                            className={`cyber-btn cyber-btn--sm status-toggle-btn ${
                              status === 'mastered'
                                ? 'cyber-btn--primary'
                                : status === 'in_progress'
                                  ? 'cyber-btn--active-state'
                                  : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSetStatus(topic.id, cycleStatus(status));
                            }}
                            title={t.statusToggleTitle}
                          >
                            {status === 'mastered' ? (
                              <Check size={11} />
                            ) : status === 'in_progress' ? (
                              <Play size={10} />
                            ) : (
                              <Circle size={10} />
                            )}
                            <span>{t.statusLabels[status]}</span>
                          </button>

                          <ArrowUpRight size={15} style={{ color: 'var(--text-tertiary)' }} />
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
