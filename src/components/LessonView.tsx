import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Code2,
  Copy,
  ExternalLink,
  HelpCircle,
  Lightbulb,
  StickyNote,
  Terminal,
} from 'lucide-react';
import type { RoadmapSection, RoadmapTopic, TopicStatus } from '../data/types';
import { UI_STRINGS } from '../data/uiStrings';
import type { AppLanguage } from '../hooks/usePreferences';
import { tokenizeTsxLines } from '../lib/monochromeHighlight';
import { openExternalUrl } from '../lib/openExternal';

interface LessonViewProps {
  language: AppLanguage;
  topic: RoadmapTopic;
  section: RoadmapSection | undefined;
  adjacent: { prev: RoadmapTopic | null; next: RoadmapTopic | null };
  status: TopicStatus;
  note: string;
  quizAnswers: Record<string, number>;
  onSetStatus: (topicId: string, status: TopicStatus) => void;
  onChangeNote: (topicId: string, text: string) => void;
  onAnswerQuiz: (questionId: string, optionIndex: number) => void;
  onOpenTopic: (topicId: string) => void;
  onNotify: (message: string) => void;
}

function SyntaxCodeBlock({
  filename,
  code,
  copyLabel,
  copiedLabel,
  onCopy,
}: {
  filename: string;
  code: string;
  copyLabel: string;
  copiedLabel: string;
  onCopy: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const lines = useMemo(() => tokenizeTsxLines(code), [code]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopy();
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      onCopy();
    }
  };

  return (
    <div className="code-deck-frame">
      <div className="code-deck-bar">
        <span className="code-deck-filename">{filename}</span>
        <button type="button" className="cyber-btn cyber-btn--sm" onClick={() => void handleCopy()}>
          {copied ? <Check size={11} /> : <Copy size={11} />}
          <span>{copied ? copiedLabel : copyLabel}</span>
        </button>
      </div>
      <pre className="code-deck-pre selectable">
        <code>
          {lines.map((lineTokens, lineIdx) => (
            <div key={lineIdx} className="code-line">
              <span className="code-line-num" aria-hidden="true">
                {lineIdx + 1}
              </span>
              <span className="code-line-content">
                {lineTokens.length === 0
                  ? ' '
                  : lineTokens.map((tok, i) =>
                      tok.kind === 'plain' ? (
                        tok.text
                      ) : (
                        <span key={i} className={`tok-${tok.kind}`}>
                          {tok.text}
                        </span>
                      )
                    )}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

export function LessonView({
  language,
  topic,
  section,
  adjacent,
  status,
  note,
  quizAnswers,
  onSetStatus,
  onChangeNote,
  onAnswerQuiz,
  onOpenTopic,
  onNotify,
}: LessonViewProps) {
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const t = UI_STRINGS[language].lesson;
  const diffLabel = UI_STRINGS[language].roadmap.difficultyLabels[topic.difficulty];
  const { prev, next } = adjacent;

  return (
    <div className="lesson-container">
      {/* Header Card */}
      <header className="hud-card hud-card--elevated lesson-header-card">
        <div className="lesson-header-top">
          <div>
            <div className="lesson-eyebrow">
              {section ? `${section.index} // ${section.title}` : t.moduleFallback} —{' '}
              {t.nodeLabel} {topic.index}
            </div>
            <h1 className="lesson-title">{topic.title}</h1>
            <p className="lesson-prose selectable" style={{ marginTop: '6px' }}>
              {topic.summary}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span className="meta-chip">
              <Clock size={10} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              {topic.estimatedMinutes} {t.minLabel}
            </span>
            <span className="meta-chip">{diffLabel}</span>
          </div>
        </div>

        <div className="lesson-header-controls">
          <div className="status-segment" role="group" aria-label="Topic mastery status">
            {(['queued', 'in_progress', 'mastered'] as TopicStatus[]).map((option) => {
              const active = status === option;
              const extraClass = active
                ? option === 'mastered'
                  ? 'cyber-btn--primary'
                  : 'cyber-btn--active-state'
                : '';

              return (
                <button
                  key={option}
                  type="button"
                  className={`cyber-btn cyber-btn--sm ${extraClass}`}
                  aria-pressed={active}
                  onClick={() => onSetStatus(topic.id, option)}
                >
                  {t.statusLabels[option]}
                </button>
              );
            })}
          </div>

          <div className="lesson-nav-btns">
            <button
              type="button"
              className="cyber-btn cyber-btn--sm"
              disabled={!prev}
              onClick={() => prev && onOpenTopic(prev.id)}
            >
              <ArrowLeft size={11} />
              <span>{prev ? `${prev.index} ${t.prevLabel}` : t.startLabel}</span>
            </button>
            <button
              type="button"
              className="cyber-btn cyber-btn--sm"
              disabled={!next}
              onClick={() => next && onOpenTopic(next.id)}
            >
              <span>{next ? `${t.nextLabel} ${next.index}` : t.endLabel}</span>
              <ArrowRight size={11} />
            </button>
          </div>
        </div>
      </header>

      {/* Core Mental Model */}
      <section className="hud-card lesson-card">
        <h2 className="lesson-section-heading">
          <BookOpen size={13} />
          <span>{t.mentalModelHeading}</span>
        </h2>

        {topic.mentalModel.paragraphs.map((para, i) => (
          <p key={i} className="lesson-prose selectable">
            {para}
          </p>
        ))}

        <ul className="lesson-takeaways selectable">
          {topic.mentalModel.takeaways.map((point, i) => (
            <li key={i} className="lesson-takeaway-item">
              <span className="lesson-takeaway-bullet">[{String(i + 1).padStart(2, '0')}]</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Code Deck & Callouts */}
      <section className="hud-card lesson-card">
        <h2 className="lesson-section-heading">
          <Code2 size={13} />
          <span>{t.codeDeckHeading}</span>
        </h2>

        <SyntaxCodeBlock
          filename={topic.codeDeck.filename}
          code={topic.codeDeck.code}
          copyLabel={t.copy}
          copiedLabel={t.copied}
          onCopy={() => onNotify(t.copiedFileToast(topic.codeDeck.filename))}
        />

        <div className="callouts-grid">
          <div className="callout-strip callout-strip--pitfall">
            <span className="callout-title">{t.pitfallTitle}</span>
            <span className="callout-body selectable">{topic.codeDeck.pitfall}</span>
          </div>
          <div className="callout-strip callout-strip--tip">
            <span className="callout-title">{t.proTipTitle}</span>
            <span className="callout-body selectable">{topic.codeDeck.proTip}</span>
          </div>
        </div>
      </section>

      {/* Mini-Challenge */}
      <section className="hud-card lesson-card">
        <h2 className="lesson-section-heading">
          <Terminal size={13} />
          <span>{t.challengeHeading}</span>
        </h2>

        <p className="lesson-prose selectable">{topic.miniChallenge.prompt}</p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="cyber-btn cyber-btn--sm"
            onClick={() => setShowHints((v) => !v)}
          >
            <Lightbulb size={11} />
            <span>
              {showHints ? t.hideHints : t.showHints(topic.miniChallenge.hints.length)}
            </span>
            {showHints ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>

          <button
            type="button"
            className={`cyber-btn cyber-btn--sm ${showSolution ? 'cyber-btn--active-state' : ''}`}
            onClick={() => setShowSolution((v) => !v)}
          >
            <Code2 size={11} />
            <span>{showSolution ? t.hideSolution : t.revealSolution}</span>
            {showSolution ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        </div>

        {showHints ? (
          <ul className="lesson-takeaways selectable">
            {topic.miniChallenge.hints.map((hint, idx) => (
              <li key={idx} className="lesson-takeaway-item">
                <span className="lesson-takeaway-bullet">HINT {idx + 1}</span>
                <span>{hint}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {showSolution ? (
          <SyntaxCodeBlock
            filename="reference-solution.tsx"
            code={topic.miniChallenge.solutionCode}
            copyLabel={t.copy}
            copiedLabel={t.copied}
            onCopy={() => onNotify(t.copiedSolutionToast)}
          />
        ) : null}
      </section>

      {/* Quick Check Interactive Quiz */}
      <section className="hud-card lesson-card">
        <h2 className="lesson-section-heading">
          <HelpCircle size={13} />
          <span>{t.quickCheckHeading}</span>
        </h2>

        {topic.quickCheck.map((q) => {
          const selected = quizAnswers[q.id];
          const answered = typeof selected === 'number';
          const isCorrect = selected === q.correctIndex;

          return (
            <div key={q.id} className="quiz-item">
              <div className="quiz-question selectable">{q.question}</div>
              <div className="quiz-options">
                {q.options.map((opt, idx) => {
                  const isPicked = selected === idx;
                  let cls = 'quiz-option';
                  if (answered && idx === q.correctIndex && (isPicked || !isCorrect)) {
                    cls += ' quiz-option--selected-correct';
                  } else if (isPicked && !isCorrect) {
                    cls += ' quiz-option--selected-wrong';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      className={cls}
                      onClick={() => onAnswerQuiz(q.id, idx)}
                    >
                      <span>{opt}</span>
                      {answered && idx === q.correctIndex ? (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                          {t.verifiedTag}
                        </span>
                      ) : isPicked ? (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                          {t.retryTag}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {answered ? (
                <div className="quiz-explanation selectable">
                  <strong>{isCorrect ? t.confirmedPrefix : t.correctionPrefix}</strong>
                  {q.explanation}
                </div>
              ) : null}
            </div>
          );
        })}
      </section>

      {/* Personal Notes Scratchpad */}
      <section className="hud-card lesson-card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 className="lesson-section-heading">
            <StickyNote size={13} />
            <span>{t.notesHeading}</span>
          </h2>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-muted)',
              letterSpacing: '0.12em',
            }}
          >
            {t.autoSynced}
          </span>
        </div>

        <textarea
          className="notes-textarea selectable"
          value={note}
          onChange={(e) => onChangeNote(topic.id, e.target.value)}
          placeholder={t.notesPlaceholder}
          aria-label={topic.title}
        />
      </section>

      {/* Official Docs Links */}
      <section className="hud-card lesson-card">
        <h2 className="lesson-section-heading">
          <ExternalLink size={13} />
          <span>{t.docsHeading}</span>
        </h2>

        <div className="docs-links-row">
          {topic.docs.map((doc) => (
            <button
              key={doc.url}
              type="button"
              className="cyber-btn cyber-btn--sm"
              onClick={() => void openExternalUrl(doc.url)}
            >
              <span>{doc.label}</span>
              <ExternalLink size={11} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
