import type { MouseEvent } from 'react';
import { Map as MapIcon, X } from 'lucide-react';
import type { RoadmapTopic, TopicStatus } from '../data/types';
import { UI_STRINGS } from '../data/uiStrings';
import type { AppLanguage } from '../hooks/usePreferences';
import { ROADMAP_TAB_ID } from '../hooks/useRoadmapStore';

interface TabBarProps {
  language: AppLanguage;
  topicMap: Map<string, RoadmapTopic>;
  openTabs: string[];
  activeTab: string;
  getStatus: (topicId: string) => TopicStatus;
  onFocusTab: (tabId: string) => void;
  onCloseTab: (topicId: string) => void;
}

export function TabBar({
  language,
  topicMap,
  openTabs,
  activeTab,
  getStatus,
  onFocusTab,
  onCloseTab,
}: TabBarProps) {
  const t = UI_STRINGS[language].tabs;

  const handleMiddleClick = (e: MouseEvent, topicId: string) => {
    if (e.button === 1) {
      e.preventDefault();
      onCloseTab(topicId);
    }
  };

  return (
    <div className="tabbar" role="tablist" aria-label="Workspace Tabs">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === ROADMAP_TAB_ID}
        className={`tabbar-tab ${activeTab === ROADMAP_TAB_ID ? 'tabbar-tab--active' : ''}`}
        onClick={() => onFocusTab(ROADMAP_TAB_ID)}
      >
        <MapIcon size={12} />
        <span className="tabbar-tab-title">{t.roadmapTab}</span>
      </button>

      {openTabs.map((topicId) => {
        const topic = topicMap.get(topicId);
        if (!topic) return null;
        const isActive = activeTab === topicId;
        const status = getStatus(topicId);

        return (
          <div
            key={topicId}
            role="tab"
            tabIndex={0}
            aria-selected={isActive}
            className={`tabbar-tab ${isActive ? 'tabbar-tab--active' : ''}`}
            onClick={() => onFocusTab(topicId)}
            onMouseDown={(e) => handleMiddleClick(e, topicId)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onFocusTab(topicId);
              }
            }}
            title={`${topic.index} ${topic.title} (${t.tabCloseTooltip})`}
          >
            <span className={`tabbar-dot tabbar-dot--${status}`} aria-hidden="true" />
            <span className="tabbar-tab-title">
              {topic.index} {topic.title}
            </span>
            <button
              type="button"
              className="tabbar-close"
              aria-label={topic.title}
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(topicId);
              }}
            >
              <X size={11} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
