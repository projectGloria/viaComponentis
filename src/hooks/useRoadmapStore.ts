import { useCallback, useEffect, useMemo, useState } from 'react';
import { ALL_TOPICS, TOPIC_MAP } from '../data/roadmap';
import type { TopicStatus } from '../data/types';

export const ROADMAP_TAB_ID = '__roadmap__';
const STORAGE_KEY = 'viacomponentis.roadmap.v1';

export type RankTitle = 'INITIATE' | 'OPERATOR' | 'ARCHITECT' | 'CORE MASTER';

export interface RoadmapPersistedState {
  statuses: Record<string, TopicStatus>;
  notes: Record<string, string>;
  openTabs: string[];
  activeTab: string;
  quizAnswers: Record<string, number>;
}

const DEFAULT_STATE: RoadmapPersistedState = {
  statuses: {},
  notes: {},
  openTabs: [],
  activeTab: ROADMAP_TAB_ID,
  quizAnswers: {},
};

function isValidStatus(value: unknown): value is TopicStatus {
  return value === 'queued' || value === 'in_progress' || value === 'mastered';
}

function sanitizeState(raw: unknown): RoadmapPersistedState {
  if (!raw || typeof raw !== 'object') return DEFAULT_STATE;
  const obj = raw as Record<string, unknown>;

  const statuses: Record<string, TopicStatus> = {};
  if (obj.statuses && typeof obj.statuses === 'object') {
    for (const [k, v] of Object.entries(obj.statuses as Record<string, unknown>)) {
      if (TOPIC_MAP.has(k) && isValidStatus(v)) {
        statuses[k] = v;
      }
    }
  }

  const notes: Record<string, string> = {};
  if (obj.notes && typeof obj.notes === 'object') {
    for (const [k, v] of Object.entries(obj.notes as Record<string, unknown>)) {
      if (TOPIC_MAP.has(k) && typeof v === 'string') {
        notes[k] = v;
      }
    }
  }

  const openTabs: string[] = [];
  if (Array.isArray(obj.openTabs)) {
    const seen = new Set<string>();
    for (const id of obj.openTabs) {
      if (typeof id === 'string' && TOPIC_MAP.has(id) && !seen.has(id)) {
        seen.add(id);
        openTabs.push(id);
      }
    }
  }

  const activeTab =
    typeof obj.activeTab === 'string' &&
    (obj.activeTab === ROADMAP_TAB_ID || openTabs.includes(obj.activeTab))
      ? obj.activeTab
      : ROADMAP_TAB_ID;

  const quizAnswers: Record<string, number> = {};
  if (obj.quizAnswers && typeof obj.quizAnswers === 'object') {
    for (const [k, v] of Object.entries(obj.quizAnswers as Record<string, unknown>)) {
      if (typeof v === 'number' && Number.isInteger(v) && v >= 0) {
        quizAnswers[k] = v;
      }
    }
  }

  return { statuses, notes, openTabs, activeTab, quizAnswers };
}

function loadState(): RoadmapPersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return sanitizeState(JSON.parse(raw));
  } catch {
    return DEFAULT_STATE;
  }
}

export function getRankFromCompletion(completionPct: number): RankTitle {
  if (completionPct >= 90) return 'CORE MASTER';
  if (completionPct >= 60) return 'ARCHITECT';
  if (completionPct >= 25) return 'OPERATOR';
  return 'INITIATE';
}

export function cycleStatus(current: TopicStatus): TopicStatus {
  if (current === 'queued') return 'in_progress';
  if (current === 'in_progress') return 'mastered';
  return 'queued';
}

export function useRoadmapStore() {
  const [state, setState] = useState<RoadmapPersistedState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [state]);

  const getStatus = useCallback(
    (topicId: string): TopicStatus => state.statuses[topicId] ?? 'queued',
    [state.statuses]
  );

  const setTopicStatus = useCallback((topicId: string, nextStatus: TopicStatus) => {
    if (!TOPIC_MAP.has(topicId)) return;
    setState((prev) => {
      const nextStatuses = { ...prev.statuses };
      if (nextStatus === 'queued') {
        delete nextStatuses[topicId];
      } else {
        nextStatuses[topicId] = nextStatus;
      }
      return { ...prev, statuses: nextStatuses };
    });
  }, []);

  const setTopicNote = useCallback((topicId: string, text: string) => {
    if (!TOPIC_MAP.has(topicId)) return;
    setState((prev) => ({
      ...prev,
      notes: { ...prev.notes, [topicId]: text },
    }));
  }, []);

  const setQuizAnswer = useCallback((questionId: string, optionIndex: number) => {
    setState((prev) => ({
      ...prev,
      quizAnswers: { ...prev.quizAnswers, [questionId]: optionIndex },
    }));
  }, []);

  const openTopicTab = useCallback((topicId: string) => {
    if (!TOPIC_MAP.has(topicId)) return;
    setState((prev) => ({
      ...prev,
      openTabs: prev.openTabs.includes(topicId) ? prev.openTabs : [...prev.openTabs, topicId],
      activeTab: topicId,
    }));
  }, []);

  const focusTab = useCallback((tabId: string) => {
    setState((prev) => {
      if (tabId !== ROADMAP_TAB_ID && !prev.openTabs.includes(tabId)) return prev;
      return { ...prev, activeTab: tabId };
    });
  }, []);

  const closeTopicTab = useCallback((topicId: string) => {
    setState((prev) => {
      const idx = prev.openTabs.indexOf(topicId);
      if (idx === -1) return prev;
      const nextTabs = prev.openTabs.filter((id) => id !== topicId);
      let nextActive = prev.activeTab;
      if (prev.activeTab === topicId) {
        nextActive = nextTabs[idx] ?? nextTabs[idx - 1] ?? ROADMAP_TAB_ID;
      }
      return { ...prev, openTabs: nextTabs, activeTab: nextActive };
    });
  }, []);

  const exportProgressJson = useCallback((): string => {
    return JSON.stringify(
      {
        app: 'viaComponentis',
        version: '0.1.0',
        exportedAt: new Date().toISOString(),
        data: state,
      },
      null,
      2
    );
  }, [state]);

  const importProgressJson = useCallback((jsonText: string): boolean => {
    try {
      const parsed = JSON.parse(jsonText) as Record<string, unknown>;
      const payload = parsed && typeof parsed === 'object' && 'data' in parsed ? parsed.data : parsed;
      const sanitized = sanitizeState(payload);
      setState(sanitized);
      return true;
    } catch {
      return false;
    }
  }, []);

  const resetProgress = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  const metrics = useMemo(() => {
    const totalTopics = ALL_TOPICS.length;
    let masteredCount = 0;
    let inProgressCount = 0;
    for (const topic of ALL_TOPICS) {
      const s = state.statuses[topic.id] ?? 'queued';
      if (s === 'mastered') masteredCount += 1;
      else if (s === 'in_progress') inProgressCount += 1;
    }
    const remainingCount = totalTopics - masteredCount;
    const completionPct = totalTopics > 0 ? Math.round((masteredCount / totalTopics) * 100) : 0;
    const rank = getRankFromCompletion(completionPct);

    return {
      totalTopics,
      masteredCount,
      inProgressCount,
      remainingCount,
      completionPct,
      rank,
    };
  }, [state.statuses]);

  return {
    state,
    metrics,
    getStatus,
    setTopicStatus,
    setTopicNote,
    setQuizAnswer,
    openTopicTab,
    focusTab,
    closeTopicTab,
    exportProgressJson,
    importProgressJson,
    resetProgress,
  };
}
