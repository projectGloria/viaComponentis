import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getLocalizedRoadmap } from './data/localizedRoadmap';
import type { TopicStatus } from './data/types';
import { UI_STRINGS } from './data/uiStrings';
import { usePreferences } from './hooks/usePreferences';
import { ROADMAP_TAB_ID, useRoadmapStore } from './hooks/useRoadmapStore';
import { CyberspaceBg } from './components/CyberspaceBg';
import { CyberToastHost, type ToastMessage } from './components/CyberToast';
import { LessonView } from './components/LessonView';
import { RoadmapView } from './components/RoadmapView';
import { Sidebar } from './components/Sidebar';
import { SplashScreen } from './components/SplashScreen';
import { TabBar } from './components/TabBar';
import { TitleBar } from './components/TitleBar';

export function App() {
  const { prefs, setLanguage, setTheme, setCodeSyntax, setDensity } = usePreferences();
  const roadmap = useMemo(() => getLocalizedRoadmap(prefs.language), [prefs.language]);
  const ui = UI_STRINGS[prefs.language];

  const {
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
  } = useRoadmapStore();

  const [showSplash, setShowSplash] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState(roadmap.sections[0].id);
  const [scrollTargetSection, setScrollTargetSection] = useState<{
    id: string;
    seq: number;
  } | null>(null);
  const [celebratePulse, setCelebratePulse] = useState(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const viewportRef = useRef<HTMLDivElement>(null);
  const toastIdRef = useRef(0);
  const celebrateTimerRef = useRef<number | null>(null);

  const notify = useCallback((text: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, text }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2400);
  }, []);

  // Trigger celebratory reticle acceleration when any topic becomes MASTERED
  const handleSetStatus = useCallback(
    (topicId: string, nextStatus: TopicStatus) => {
      const prevStatus = getStatus(topicId);
      setTopicStatus(topicId, nextStatus);

      if (nextStatus === 'mastered' && prevStatus !== 'mastered') {
        setCelebratePulse((n) => n + 1);
        if (celebrateTimerRef.current) window.clearTimeout(celebrateTimerRef.current);
        celebrateTimerRef.current = window.setTimeout(() => {
          setCelebratePulse(0);
        }, 1800);
        const topic = roadmap.topicMap.get(topicId);
        notify(ui.toasts.nodeMastered(topic?.index ?? '', topic?.title ?? ''));
      }
    },
    [getStatus, notify, roadmap.topicMap, setTopicStatus, ui.toasts]
  );

  // Global Ctrl+W closes the active topic tab instead of closing the desktop shell
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        if (state.activeTab !== ROADMAP_TAB_ID) {
          e.preventDefault();
          closeTopicTab(state.activeTab);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeTopicTab, state.activeTab]);

  // Reset internal viewport scroll when switching lesson tabs
  useEffect(() => {
    if (state.activeTab !== ROADMAP_TAB_ID) {
      viewportRef.current?.scrollTo({ top: 0 });
    }
  }, [state.activeTab]);

  const handleJumpToSection = useCallback(
    (sectionId: string) => {
      setActiveSectionId(sectionId);
      focusTab(ROADMAP_TAB_ID);
      setScrollTargetSection((prev) => ({ id: sectionId, seq: (prev?.seq ?? 0) + 1 }));
    },
    [focusTab]
  );

  const handleExport = useCallback(() => {
    const json = exportProgressJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'viacomponentis-roadmap-progress.json';
    a.click();
    URL.revokeObjectURL(url);
    notify(ui.toasts.exported);
  }, [exportProgressJson, notify, ui.toasts.exported]);

  const handleImport = useCallback(
    (jsonText: string) => {
      const ok = importProgressJson(jsonText);
      notify(ok ? ui.toasts.importedOk : ui.toasts.importedErr);
    },
    [importProgressJson, notify, ui.toasts.importedErr, ui.toasts.importedOk]
  );

  const handleReset = useCallback(() => {
    resetProgress();
    notify(ui.toasts.resetDone);
  }, [notify, resetProgress, ui.toasts.resetDone]);

  const activeTopic =
    state.activeTab !== ROADMAP_TAB_ID ? roadmap.topicMap.get(state.activeTab) ?? null : null;

  const activeContextLabel = activeTopic
    ? `${activeTopic.index} // ${activeTopic.title.toUpperCase()}`
    : ui.titleBar.roadmapContext;

  return (
    <>
      <CyberspaceBg theme={prefs.theme} />

      <div className="app-shell">
        <TitleBar
          activeContextLabel={activeContextLabel}
          language={prefs.language}
          theme={prefs.theme}
          codeSyntax={prefs.codeSyntax}
          density={prefs.density}
          onSetLanguage={(lang) => {
            setLanguage(lang);
            notify(lang === 'tr' ? UI_STRINGS.tr.toasts.langTr : UI_STRINGS.en.toasts.langEn);
          }}
          onSetTheme={(t) => {
            setTheme(t);
            notify(t === 'claude' ? ui.toasts.themeClaude : ui.toasts.themeNoir);
          }}
          onSetCodeSyntax={setCodeSyntax}
          onSetDensity={setDensity}
          onReplaySplash={() => setShowSplash(true)}
        />

        <div className="workspace-body">
          <Sidebar
            language={prefs.language}
            sections={roadmap.sections}
            activeSectionId={activeSectionId}
            getStatus={getStatus}
            masteredCount={metrics.masteredCount}
            totalTopics={metrics.totalTopics}
            completionPct={metrics.completionPct}
            rank={metrics.rank}
            celebratePulse={celebratePulse}
            onJumpToSection={handleJumpToSection}
            onExport={handleExport}
            onImport={handleImport}
            onReset={handleReset}
          />

          <main className="right-workspace">
            <TabBar
              language={prefs.language}
              topicMap={roadmap.topicMap}
              openTabs={state.openTabs}
              activeTab={state.activeTab}
              getStatus={getStatus}
              onFocusTab={focusTab}
              onCloseTab={closeTopicTab}
            />

            <div ref={viewportRef} className="workspace-viewport">
              {activeTopic ? (
                <LessonView
                  key={activeTopic.id}
                  language={prefs.language}
                  topic={activeTopic}
                  section={roadmap.sectionByTopicId.get(activeTopic.id)}
                  adjacent={roadmap.getAdjacentTopics(activeTopic.id)}
                  status={getStatus(activeTopic.id)}
                  note={state.notes[activeTopic.id] ?? ''}
                  quizAnswers={state.quizAnswers}
                  onSetStatus={handleSetStatus}
                  onChangeNote={setTopicNote}
                  onAnswerQuiz={setQuizAnswer}
                  onOpenTopic={openTopicTab}
                  onNotify={notify}
                />
              ) : (
                <RoadmapView
                  language={prefs.language}
                  sections={roadmap.sections}
                  getStatus={getStatus}
                  totalTopics={metrics.totalTopics}
                  masteredCount={metrics.masteredCount}
                  inProgressCount={metrics.inProgressCount}
                  completionPct={metrics.completionPct}
                  scrollTargetSection={scrollTargetSection}
                  onActiveSectionChange={setActiveSectionId}
                  onOpenTopic={openTopicTab}
                  onSetStatus={handleSetStatus}
                />
              )}
            </div>
          </main>
        </div>
      </div>

      {showSplash ? (
        <SplashScreen
          language={prefs.language}
          masteredCount={metrics.masteredCount}
          totalTopics={metrics.totalTopics}
          onComplete={() => setShowSplash(false)}
        />
      ) : null}

      <CyberToastHost toasts={toasts} />
    </>
  );
}

export default App;
