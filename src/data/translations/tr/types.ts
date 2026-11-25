export interface QuizTranslation {
  question: string;
  options: string[];
  explanation: string;
}

export interface TopicTranslation {
  title: string;
  summary: string;
  mentalModel: {
    paragraphs: string[];
    takeaways: string[];
  };
  pitfall: string;
  proTip: string;
  challengePrompt: string;
  challengeHints: string[];
  quickCheck: Record<string, QuizTranslation>;
}

export interface SectionTranslation {
  title: string;
  subtitle: string;
  topics: Record<string, TopicTranslation>;
}
