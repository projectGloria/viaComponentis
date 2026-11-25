import type { AppLanguage } from '../hooks/usePreferences';
import {
  ALL_TOPICS,
  getAdjacentTopics,
  ROADMAP_SECTIONS,
  SECTION_BY_TOPIC_ID,
  TOPIC_MAP,
} from './roadmap';
import type { RoadmapSection, RoadmapTopic } from './types';
import type { SectionTranslation } from './translations/tr/types';
import { translateCodeCommentsToTr } from './translations/tr/codeCommentsTr';
import { section01Tr } from './translations/tr/section01Tr';
import { section02Tr } from './translations/tr/section02Tr';
import { section03Tr } from './translations/tr/section03Tr';
import { section04Tr } from './translations/tr/section04Tr';
import { section05Tr } from './translations/tr/section05Tr';
import { section06Tr } from './translations/tr/section06Tr';

export const TR_SECTIONS: Record<string, SectionTranslation> = {
  'getting-started': section01Tr,
  'components-composition': section02Tr,
  'state-core-hooks': section03Tr,
  'effects-sync-lifecycle': section04Tr,
  'architecture-data-flow': section05Tr,
  'performance-modern-react': section06Tr,
};

export interface LocalizedRoadmapData {
  sections: RoadmapSection[];
  allTopics: RoadmapTopic[];
  topicMap: Map<string, RoadmapTopic>;
  sectionByTopicId: Map<string, RoadmapSection>;
  getAdjacentTopics: (topicId: string) => {
    prev: RoadmapTopic | null;
    next: RoadmapTopic | null;
  };
}

function buildTurkishSections(): RoadmapSection[] {
  return ROADMAP_SECTIONS.map((section) => {
    const trSection = TR_SECTIONS[section.id];
    if (!trSection) return section;

    const topics: RoadmapTopic[] = section.topics.map((topic) => {
      const trTopic = trSection.topics[topic.id];
      if (!trTopic) return topic;

      return {
        ...topic,
        title: trTopic.title,
        summary: trTopic.summary,
        mentalModel: trTopic.mentalModel,
        codeDeck: {
          ...topic.codeDeck,
          code: translateCodeCommentsToTr(topic.codeDeck.code),
          pitfall: trTopic.pitfall,
          proTip: trTopic.proTip,
        },
        miniChallenge: {
          ...topic.miniChallenge,
          prompt: trTopic.challengePrompt,
          hints: trTopic.challengeHints,
          solutionCode: translateCodeCommentsToTr(topic.miniChallenge.solutionCode),
        },
        quickCheck: topic.quickCheck.map((q) => {
          const trQ = trTopic.quickCheck[q.id];
          if (!trQ) return q;
          return {
            ...q,
            question: trQ.question,
            options: trQ.options,
            explanation: trQ.explanation,
          };
        }),
      };
    });

    return {
      ...section,
      title: trSection.title,
      subtitle: trSection.subtitle,
      topics,
    };
  });
}

const TURKISH_SECTIONS = buildTurkishSections();
const TURKISH_ALL_TOPICS = TURKISH_SECTIONS.flatMap((s) => s.topics);
const TURKISH_TOPIC_MAP = new Map<string, RoadmapTopic>(
  TURKISH_ALL_TOPICS.map((t) => [t.id, t])
);
const TURKISH_SECTION_BY_TOPIC_ID = new Map<string, RoadmapSection>(
  TURKISH_SECTIONS.flatMap((s) => s.topics.map((t) => [t.id, s] as const))
);

function getTurkishAdjacentTopics(topicId: string) {
  const idx = TURKISH_ALL_TOPICS.findIndex((t) => t.id === topicId);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? TURKISH_ALL_TOPICS[idx - 1] : null,
    next: idx < TURKISH_ALL_TOPICS.length - 1 ? TURKISH_ALL_TOPICS[idx + 1] : null,
  };
}

export function getLocalizedRoadmap(lang: AppLanguage): LocalizedRoadmapData {
  if (lang === 'en') {
    return {
      sections: ROADMAP_SECTIONS,
      allTopics: ALL_TOPICS,
      topicMap: TOPIC_MAP,
      sectionByTopicId: SECTION_BY_TOPIC_ID,
      getAdjacentTopics,
    };
  }

  return {
    sections: TURKISH_SECTIONS,
    allTopics: TURKISH_ALL_TOPICS,
    topicMap: TURKISH_TOPIC_MAP,
    sectionByTopicId: TURKISH_SECTION_BY_TOPIC_ID,
    getAdjacentTopics: getTurkishAdjacentTopics,
  };
}
