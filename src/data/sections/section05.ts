import type { RoadmapSection } from '../types';

export const section05: RoadmapSection = {
  id: 'architecture-data-flow',
  index: '05',
  title: 'Architecture & Data Flow',
  subtitle: 'Context splitting, server-state caching concepts, client routing, Error Boundaries, Suspense, and feature colocation.',
  topics: [
    {
      id: 'context-api-rerender-traps',
      index: '05.1',
      title: 'Context API & Avoiding Re-render Traps',
      summary: 'Share cross-tree state cleanly with Context while splitting fast-changing state from stable dispatchers.',
      estimatedMinutes: 17,
      difficulty: 'Intermediate',
      tags: ['Context', 'Re-renders', 'State Splitting'],
      mentalModel: {
        paragraphs: [
          'Context lets a parent broadcast values (auth user, theme, reducer `dispatch`) to any descendant without prop drilling. However, every component calling `useContext(Ctx)` re-renders whenever the provider’s `value` fails `Object.is` comparison.',
          'If you write `<AppContext value={{ state, dispatch }}>`, a brand-new object literal is allocated on EVERY render of the provider, forcing every consumer to re-render—even ones that only needed `dispatch`! Split state and dispatch into two contexts, or memoize the value object.',
        ],
        takeaways: [
          'In React 19, render `<MyContext value={val}>` directly—`.Provider` is still supported but optional.',
          'Split `StateContext` and `DispatchContext` so action-only buttons never re-render when state changes.',
          'Context is great for low-to-medium frequency global state; high-frequency ticks (60fps mouse/animation) belong in refs or external stores.',
        ],
      },
      codeDeck: {
        filename: 'SplitContext.tsx',
        language: 'tsx',
        code: `import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';

type Action = { type: 'INCREMENT' };
const CountStateCtx = createContext<number | null>(null);
const CountDispatchCtx = createContext<Dispatch<Action> | null>(null);

function reducer(state: number, action: Action) {
  return action.type === 'INCREMENT' ? state + 1 : state;
}

export function CountProvider({ children }: { children: ReactNode }) {
  const [count, dispatch] = useReducer(reducer, 0);
  return (
    <CountStateCtx value={count}>
      <CountDispatchCtx value={dispatch}>{children}</CountDispatchCtx>
    </CountStateCtx>
  );
}

export function useCountDispatch() {
  const dispatch = useContext(CountDispatchCtx);
  if (!dispatch) throw new Error('Must be inside CountProvider');
  return dispatch;
}`,
        pitfall: 'Putting `{ user, filters, toastQueue, openModal }` into one giant Context causes unrelated panels to re-render on every keystroke.',
        proTip: 'Before adding Context, check if simply passing `<Layout sidebar={<Sidebar user={user} />} />` via composition solves it with zero indirection.',
      },
      miniChallenge: {
        prompt: 'Fix `<PrefsContext value={{ density, setDensity }}>` so consumers do not receive a new object reference when the parent re-renders for unrelated state.',
        hints: [
          'Wrap `{ density, setDensity }` in `useMemo`.',
          'Depend only on `[density]` because `setDensity` from `useState` is stable.',
        ],
        solutionCode: `import { createContext, useMemo, useState, type ReactNode } from 'react';

interface Prefs {
  density: 'compact' | 'cozy';
  setDensity: (d: 'compact' | 'cozy') => void;
}

const PrefsContext = createContext<Prefs | null>(null);

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [density, setDensity] = useState<'compact' | 'cozy'>('compact');
  const value = useMemo(() => ({ density, setDensity }), [density]);
  return <PrefsContext value={value}>{children}</PrefsContext>;
}`,
      },
      quickCheck: [
        {
          id: 'qc-05-1-a',
          question: 'Why does separating `StateContext` and `DispatchContext` prevent unnecessary re-renders?',
          options: [
            '`dispatch` from `useReducer` keeps the same identity forever, so components reading only `DispatchContext` do not re-render when `state` changes.',
            '`DispatchContext` disables React reconciliation.',
          ],
          correctIndex: 0,
          explanation: 'Consumers only subscribe to the context they read; a stable `dispatch` reference never triggers context notifications.',
        },
      ],
      docs: [
        { label: 'React.dev — Passing Data Deeply with Context', url: 'https://react.dev/learn/passing-data-deeply-with-context' },
        { label: 'React.dev — useContext Reference', url: 'https://react.dev/reference/react/useContext' },
      ],
    },
    {
      id: 'data-fetching-tanstack-query',
      index: '05.2',
      title: 'Data Fetching & TanStack Query Concepts',
      summary: 'Separate asynchronous server cache from UI state, and understand stale-while-revalidate + invalidation.',
      estimatedMinutes: 18,
      difficulty: 'Intermediate',
      tags: ['Data Fetching', 'Server State', 'Caching'],
      mentalModel: {
        paragraphs: [
          'Remote API data is fundamentally different from local UI state (`modalOpen`, `searchQuery`): server data is asynchronous, owned remotely, shared across components, and can go stale at any time.',
          'Libraries like TanStack Query (or React 19 `use(promise)` with Suspense caches) solve the hard edge cases automatically: request deduplication by query key, background refetching, retry backoff, optimistic mutations, and cache invalidation (`invalidateQueries`) after writes.',
        ],
        takeaways: [
          'Treat server responses as a *cache* keyed by `[resource, params]`, not manual `useState` copies.',
          'Always handle loading, error, and empty states explicitly—and abort or deduplicate overlapping fetches.',
          'After a mutation (`POST`/`PATCH`/`DELETE`), invalidate affected query keys so every mounted view refreshes cleanly.',
        ],
      },
      codeDeck: {
        filename: 'useQueryConcept.tsx',
        language: 'tsx',
        code: `import { useEffect, useState } from 'react';

export interface QueryState<T> {
  status: 'loading' | 'error' | 'success';
  data?: T;
  error?: string;
}

// Minimal illustration of the state machine TanStack Query automates with caching
export function useFetchJson<T>(url: string): QueryState<T> {
  const [state, setState] = useState<QueryState<T>>({ status: 'loading' });

  useEffect(() => {
    const ac = new AbortController();
    setState({ status: 'loading' });

    fetch(url, { signal: ac.signal })
      .then((r) => {
        if (!r.ok) throw new Error(\`HTTP \${r.status}\`);
        return r.json() as Promise<T>;
      })
      .then((data) => setState({ status: 'success', data }))
      .catch((err: unknown) => {
        if ((err as Error).name !== 'AbortError') {
          setState({ status: 'error', error: String(err) });
        }
      });

    return () => ac.abort();
  }, [url]);

  return state;
}`,
        pitfall: 'Copying fetched server data into Redux or local `useState` and forgetting to refresh it leaves users staring at stale records after edits.',
        proTip: 'Include every filter and pagination parameter in your cache key (e.g. `["topics", { filter, page }]`) so switching filters never flashes wrong results.',
      },
      miniChallenge: {
        prompt: 'Render a discriminated `QueryState<Topic[]>` cleanly using early returns for `"loading"` and `"error"` before rendering the `"success"` list.',
        hints: [
          'Check `state.status === "loading"` and `state.status === "error"` first.',
          'TypeScript narrows `state.data` once both are handled.',
        ],
        solutionCode: `export function TopicList({ state }: { state: { status: 'loading' } | { status: 'error'; error: string } | { status: 'success'; data: { id: string; title: string }[] } }) {
  if (state.status === 'loading') return <p>SYNCHRONIZING...</p>;
  if (state.status === 'error') return <p>FAULT: {state.error}</p>;

  return (
    <ul>
      {state.data.map((item) => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  );
}`,
      },
      quickCheck: [
        {
          id: 'qc-05-2-a',
          question: 'Why does TanStack Query require an array `queryKey` like `["node", nodeId]`?',
          options: [
            'To uniquely identify, deduplicate, cache, and selectively invalidate that exact data slice.',
            'Because JavaScript `fetch` requires array headers.',
          ],
          correctIndex: 0,
          explanation: 'Query keys serve as the deterministic cache address for deduplication and invalidation.',
        },
      ],
      docs: [
        { label: 'React.dev — Fetching Data', url: 'https://react.dev/reference/react/useEffect#fetching-data-with-effects' },
        { label: 'React.dev — `use` Hook (React 19)', url: 'https://react.dev/reference/react/use' },
      ],
    },
    {
      id: 'client-side-routing-url-state',
      index: '05.3',
      title: 'Client-Side Routing & URL State',
      summary: 'Treat the URL as shareable state for routes, search filters, and nested layouts.',
      estimatedMinutes: 15,
      difficulty: 'Intermediate',
      tags: ['Routing', 'URLSearchParams', 'Deep Linking'],
      mentalModel: {
        paragraphs: [
          'In single-page React apps (or multi-view desktop workspaces), navigation intercepts link clicks via the History API (`pushState` / `popstate`) so views swap without full browser reloads. Tools like React Router and TanStack Router also support nested `<Outlet />` layouts and route-level data loaders.',
          'Just as important: keep shareable navigation state (current filter, active tab, search query, page number) in URL search params (`URLSearchParams`) when running on the web so Reload, Back, Forward, and Copy-Link work naturally.',
        ],
        takeaways: [
          'Put sharable view state (selected entity, filters, sort) in the URL; put ephemeral UI state (dropdown open, hover) in `useState`.',
          'Code-split heavy routes with `React.lazy(() => import("./HeavyView"))` so initial boot stays fast.',
          'In desktop Tauri apps without browser URL bars, an explicit tab/route state machine gives identical multi-pane ergonomics.',
        ],
      },
      codeDeck: {
        filename: 'useUrlParam.ts',
        language: 'tsx',
        code: `import { useCallback, useState } from 'react';

export function useUrlSearchParam(key: string, fallback: string) {
  const [value, setValue] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get(key) ?? fallback;
  });

  const update = useCallback(
    (next: string) => {
      const url = new URL(window.location.href);
      if (next === fallback || next === '') url.searchParams.delete(key);
      else url.searchParams.set(key, next);
      window.history.replaceState(null, '', url.toString());
      setValue(next);
    },
    [key, fallback]
  );

  return [value, update] as const;
}`,
        pitfall: 'Using `<a href="/lesson/1">` without router interception or `preventDefault()` triggers a full page reload and wipes in-memory state.',
        proTip: 'Prefetch route chunks on link `onMouseEnter` or `onFocus` for instant zero-spinner transitions.',
      },
      miniChallenge: {
        prompt: 'Write a lazy-loaded route wrapper using `React.lazy` and `Suspense` that falls back to `"LOADING MODULE..."`.',
        hints: [
          'Define `const AnalyticsView = lazy(() => import("./AnalyticsView"));`.',
          'Wrap `<AnalyticsView />` inside `<Suspense fallback={...}>`.',
        ],
        solutionCode: `import { lazy, Suspense } from 'react';

const AnalyticsView = lazy(() => import('./AnalyticsView'));

export function AnalyticsRoute() {
  return (
    <Suspense fallback={<div className="hud-card">LOADING MODULE...</div>}>
      <AnalyticsView />
    </Suspense>
  );
}`,
      },
      quickCheck: [
        {
          id: 'qc-05-3-a',
          question: 'Which state belongs in URL query parameters rather than component `useState`?',
          options: [
            'Whether a tooltip is currently hovered.',
            'Active search query, filter tab, and pagination index that should survive refresh or link sharing.',
          ],
          correctIndex: 1,
          explanation: 'URL parameters make navigation and filtered views bookmarkable and resilient to reloads.',
        },
      ],
      docs: [
        { label: 'React.dev — lazy Reference', url: 'https://react.dev/reference/react/lazy' },
      ],
    },
    {
      id: 'error-boundaries-suspense',
      index: '05.4',
      title: 'Error Boundaries & `Suspense`',
      summary: 'Isolate runtime crashes with Error Boundaries and coordinate async loading states declaratively with `Suspense`.',
      estimatedMinutes: 17,
      difficulty: 'Intermediate',
      tags: ['ErrorBoundary', 'Suspense', 'Resilience'],
      mentalModel: {
        paragraphs: [
          'By default, an uncaught JavaScript error inside any component unmounts the entire React application. An **Error Boundary** (a small class component implementing `getDerivedStateFromError` and `componentDidCatch`) catches render/lifecycle errors in its subtree and renders a recoverable fallback UI.',
          '`<Suspense fallback={<Skeleton />}>` works analogously for async loading: when any child suspends (e.g., `lazy()` import or React 19 `use(promise)`), React shows the nearest `Suspense` fallback until ready, preventing nested spinner waterfalls.',
        ],
        takeaways: [
          'Error Boundaries still require a class component (or `react-error-boundary` library) in React 19.',
          'Error Boundaries do NOT catch errors inside async callbacks, `setTimeout`, or event handlers—handle those with `try/catch`.',
          'Place Error Boundaries around independent workspace panes so one broken tab never crashes the whole shell.',
        ],
      },
      codeDeck: {
        filename: 'PanelErrorBoundary.tsx',
        language: 'tsx',
        code: `import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  error: Error | null;
}

export class PanelErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Subsystem fault:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="hud-card">
          <h4>{this.props.fallbackTitle ?? 'SUBSYSTEM FAULT'}</h4>
          <p>{this.state.error.message}</p>
          <button type="button" onClick={() => this.setState({ error: null })}>
            REBOOT PANE
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}`,
        pitfall: 'Wrapping only the root `<App />` in one Error Boundary forces the user to lose their entire workspace on a single widget crash.',
        proTip: 'Pass `key={activeTabId}` to `<PanelErrorBoundary key={activeTabId}>` so switching to another tab automatically resets a tripped boundary.',
      },
      miniChallenge: {
        prompt: 'Explain how you would safely render an async `topicPromise` in React 19 using `use(promise)` wrapped in both `<PanelErrorBoundary>` and `<Suspense>`.',
        hints: [
          'Put `<PanelErrorBoundary>` outside `<Suspense>` so rejected promises render the error fallback.',
          'Inside the child component, call `const data = use(topicPromise);`.',
        ],
        solutionCode: `import { Suspense, use } from 'react';
import { PanelErrorBoundary } from './PanelErrorBoundary';

function TopicDetails({ topicPromise }: { topicPromise: Promise<{ title: string }> }) {
  const topic = use(topicPromise);
  return <h2>{topic.title}</h2>;
}

export function TopicLoader({ topicPromise }: { topicPromise: Promise<{ title: string }> }) {
  return (
    <PanelErrorBoundary fallbackTitle="LOAD FAULT">
      <Suspense fallback={<p>DECODING NODE...</p>}>
        <TopicDetails topicPromise={topicPromise} />
      </Suspense>
    </PanelErrorBoundary>
  );
}`,
      },
      quickCheck: [
        {
          id: 'qc-05-4-a',
          question: 'Which error is NOT caught by a React Error Boundary?',
          options: [
            'An exception thrown while rendering JSX inside a child component.',
            'An uncaught exception thrown inside an `onClick` async event handler.',
          ],
          correctIndex: 1,
          explanation: 'Event handlers and async callbacks execute outside React rendering; use `try/catch` inside handlers.',
        },
      ],
      docs: [
        { label: 'React.dev — Catching Rendering Errors with an Error Boundary', url: 'https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary' },
        { label: 'React.dev — Suspense', url: 'https://react.dev/reference/react/Suspense' },
      ],
    },
    {
      id: 'feature-based-colocation',
      index: '05.5',
      title: 'Feature-Based Architecture & Colocation',
      summary: 'Scale codebases cleanly by grouping components, hooks, types, and tests by domain feature.',
      estimatedMinutes: 14,
      difficulty: 'Intermediate',
      tags: ['Architecture', 'Colocation', 'Maintainability'],
      mentalModel: {
        paragraphs: [
          'Small apps start by sorting files by technical kind (`components/`, `hooks/`, `utils/`). Once you pass 30+ components, finding every piece belonging to one feature means hopping across five folders.',
          '**Colocation** keeps code as close as possible to where it is used: put shared design-system primitives (`Button`, `HudCard`) in `components/ui/` or `components/`, and group domain modules under `features/<domain>/` with explicit public exports.',
        ],
        takeaways: [
          'Keep state, helper functions, and styles colocated with the feature that owns them until a second feature genuinely needs them.',
          'Avoid circular imports and giant barrel `index.ts` re-exports that hurt tree-shaking and Vite HMR.',
          'Enforce one-way dependency flow: `features/*` -> `components/` & `lib/`, never `lib/` -> `features/`.',
        ],
      },
      codeDeck: {
        filename: 'architecture-map.ts',
        language: 'tsx',
        code: `// Recommended feature-colocated structure for medium/large React apps:
// src/
//   app/          -> App shell, providers, top-level router
//   components/   -> Shared monochrome UI primitives (HudCard, CyberButton)
//   features/
//     roadmap/    -> RoadmapGraph.tsx, useRoadmapFilter.ts, roadmapTypes.ts
//     lesson/     -> LessonDeck.tsx, CodeDeck.tsx, QuickCheck.tsx
//   lib/          -> Pure utilities (monochromeHighlight.ts, tauriWindow.ts)
//   styles/       -> theme.css, app.css

export type ArchitectureLayer = 'app' | 'features' | 'components' | 'lib';`,
        pitfall: 'Creating `components/common/helpers/utils/index.ts` chains causes circular dependency errors and slows down TypeScript language service.',
        proTip: 'Rule of Three: wait until a helper or component is needed in 3 distinct places before promoting it to shared `lib/` or `components/`.',
      },
      miniChallenge: {
        prompt: 'Design a clean boundary rule for a `features/notes` module so `features/roadmap` never imports internal helpers from `features/notes/internal/`.',
        hints: [
          'Expose only the public component/hook from `features/notes/NotesPad.tsx`.',
          'Keep storage keys and parsing isolated inside `features/notes/`.',
        ],
        solutionCode: `// Public contract exposed by the feature:
export interface NotesPadProps {
  topicId: string;
  value: string;
  onChange: (next: string) => void;
}
// Internal serialization details stay private to the notes module.`,
      },
      quickCheck: [
        {
          id: 'qc-05-5-a',
          question: 'What is the core principle behind colocation in React codebases?',
          options: [
            'Keep components, hooks, tests, and domain types close to the feature that uses them rather than scattered across global folders.',
            'Put every component into a single `App.tsx` file.',
          ],
          correctIndex: 0,
          explanation: 'Colocation minimizes cognitive jump distance and makes deleting or refactoring a feature self-contained.',
        },
      ],
      docs: [
        { label: 'React.dev — Thinking in React', url: 'https://react.dev/learn/thinking-in-react' },
      ],
    },
  ],
};
