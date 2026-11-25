export type TopicStatus = 'queued' | 'in_progress' | 'mastered';

export type Difficulty = 'Core' | 'Intermediate' | 'Advanced';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DocLink {
  label: string;
  url: string;
}

export interface CodeDeck {
  filename: string;
  language: 'tsx';
  code: string;
  pitfall: string;
  proTip: string;
}

export interface MiniChallenge {
  prompt: string;
  hints: string[];
  solutionCode: string;
}

export interface RoadmapTopic {
  id: string;
  index: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  difficulty: Difficulty;
  tags: string[];
  mentalModel: {
    paragraphs: string[];
    takeaways: string[];
  };
  codeDeck: CodeDeck;
  miniChallenge: MiniChallenge;
  quickCheck: QuizQuestion[];
  docs: DocLink[];
}

export interface RoadmapSection {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  topics: RoadmapTopic[];
}
