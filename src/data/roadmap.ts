import type { RoadmapSection, RoadmapTopic } from './types';
import { section01 } from './sections/section01';
import { section02 } from './sections/section02';
import { section03 } from './sections/section03';
import { section04 } from './sections/section04';
import { section05 } from './sections/section05';
import { section06 } from './sections/section06';

export const ROADMAP_SECTIONS: RoadmapSection[] = [
  section01,
  section02,
  section03,
  section04,
  section05,
  section06,
];

export const ALL_TOPICS: RoadmapTopic[] = ROADMAP_SECTIONS.flatMap((s) => s.topics);

export const TOPIC_MAP = new Map<string, RoadmapTopic>(
  ALL_TOPICS.map((topic) => [topic.id, topic])
);

export const SECTION_BY_TOPIC_ID = new Map<string, RoadmapSection>(
  ROADMAP_SECTIONS.flatMap((section) =>
    section.topics.map((topic) => [topic.id, section] as const)
  )
);

export function getAdjacentTopics(topicId: string): {
  prev: RoadmapTopic | null;
  next: RoadmapTopic | null;
} {
  const idx = ALL_TOPICS.findIndex((t) => t.id === topicId);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? ALL_TOPICS[idx - 1] : null,
    next: idx < ALL_TOPICS.length - 1 ? ALL_TOPICS[idx + 1] : null,
  };
}
