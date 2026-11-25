import type { RoadmapSection } from '../types';

export const section03: RoadmapSection = {
  id: 'state-core-hooks',
  index: '03',
  title: 'State & Core Hooks',
  subtitle: 'State snapshots, batching, lifting state up, reducers, refs, and hook closure mechanics.',
  topics: [
    {
      id: 'usestate-and-batching',
      index: '03.1',
      title: '`useState` & Automatic Batching',
      summary: 'Understand state as render snapshots, functional updaters, lazy initializers, and React 19 batching.',
      estimatedMinutes: 16,
      difficulty: 'Core',
      tags: ['useState', 'Batching', 'Functional Updater'],
      mentalModel: {
        paragraphs: [
          'Calling `setState(next)` does NOT mutate the state variable inside the currently running function—it schedules a future re-render with `next`. Within a single event handler, the state variable stays frozen at the snapshot value of that render.',
          'React batches multiple `setState` calls anywhere (event handlers, `setTimeout`, Promises, native events) into a single re-render. When the next state depends on the previous one, pass an updater function `setCount(c => c + 1)` so queued updates compose cleanly.',
        ],
        takeaways: [
          'Use `setCount(prev => prev + 1)` whenever multiple updates can queue within one tick.',
          'Pass a function to `useState(() => parseLocalStorage())` so expensive initialization runs only on mount.',
          'Never store values in state that can be computed directly from existing props or state.',
        ],
      },
      codeDeck: {
        filename: 'BatchCounter.tsx',
        language: 'tsx',
        code: `import { useState } from 'react';

export function BatchCounter() {
  // Lazy initializer runs once on mount, not on every re-render
  const [count, setCount] = useState<number>(() => {
    const saved = localStorage.getItem('node_count');
    return saved ? Number(saved) || 0 : 0;
  });

  function incrementTwice() {
    // Both updater functions queue against the latest pending state
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
  }

  return (
    <button type="button" onClick={incrementTwice}>
      COUNT :: {count}
    </button>
  );
}`,
        pitfall: 'Writing `setCount(count + 1); setCount(count + 1);` only increments by 1 because `count` is fixed in that render snapshot.',
        proTip: 'Calling `useState(expensiveFn())` invokes `expensiveFn()` on every render; `useState(expensiveFn)` invokes it once.',
      },
      miniChallenge: {
        prompt: 'Write a `useState` setup that initializes an empty `Set<string>` lazily and toggles an ID immutably without mutating the previous `Set`.',
        hints: [
          'Pass `() => new Set<string>()` to `useState`.',
          'Inside the functional updater, clone with `const next = new Set(prev)`.',
        ],
        solutionCode: `import { useState } from 'react';

export function useToggleSet() {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return { selected, toggle };
}`,
      },
      quickCheck: [
        {
          id: 'qc-03-1-a',
          question: 'In React 19, when `setA(1)` and `setB(2)` are called inside `fetch().then(...)`, how many renders occur?',
          options: [
            'Two separate renders (batching only works in synthetic click events).',
            'One batched render.',
          ],
          correctIndex: 1,
          explanation: 'Automatic batching in React 18+ / 19 batches state updates inside promises, timeouts, and native event listeners.',
        },
      ],
      docs: [
        { label: 'React.dev — State as a Snapshot', url: 'https://react.dev/learn/state-as-a-snapshot' },
        { label: 'React.dev — Queueing a Series of State Updates', url: 'https://react.dev/learn/queueing-a-series-of-state-updates' },
      ],
    },
    {
      id: 'lifting-state-up',
      index: '03.2',
      title: 'Structuring & Lifting State Up',
      summary: 'Maintain a single source of truth, derive values instead of duplicating state, and coordinate siblings.',
      estimatedMinutes: 15,
      difficulty: 'Core',
      tags: ['Derived State', 'Single Source of Truth', 'Architecture'],
      mentalModel: {
        paragraphs: [
          'When two sibling components need to stay synchronized, remove the local state from both and lift it to their closest common parent. Pass the state down as props and callbacks up.',
          'Just as important: keep state minimal. Avoid storing `filteredItems` or `fullName` or `completionPct` in state if you already have `items`, `query`, `firstName`, and `lastName`. Computing derived data during render prevents synchronization bugs completely.',
        ],
        takeaways: [
          'Store IDs (e.g. `selectedTopicId`) rather than duplicating entire objects from an array in state.',
          'Derive totals, percentages, and filtered lists directly during render.',
          'Push state as far DOWN the tree as possible when only one branch needs it, and lift only when siblings must share it.',
        ],
      },
      codeDeck: {
        filename: 'TopicExplorer.tsx',
        language: 'tsx',
        code: `import { useState } from 'react';

interface Topic {
  id: string;
  title: string;
  mastered: boolean;
}

export function TopicExplorer({ topics }: { topics: Topic[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Derived cleanly during render — zero duplicate state to sync
  const selectedTopic = topics.find((t) => t.id === selectedId) ?? null;
  const masteredCount = topics.filter((t) => t.mastered).length;

  return (
    <div>
      <p>Mastered: {masteredCount} / {topics.length}</p>
      {topics.map((t) => (
        <button key={t.id} type="button" onClick={() => setSelectedId(t.id)}>
          {t.title}
        </button>
      ))}
      {selectedTopic ? <h4>Active: {selectedTopic.title}</h4> : null}
    </div>
  );
}`,
        pitfall: 'Copying a prop into `useState(props.items)` causes your component to ignore future updates from the parent.',
        proTip: 'If you ever want to reset a child’s internal state when switching items (like switching lessons), pass `key={topic.id}` to the child.',
      },
      miniChallenge: {
        prompt: 'Refactor a component that stores `items`, `search`, and `filteredItems` in three `useState` hooks into two minimal state pieces + derived filtering.',
        hints: [
          'Delete `filteredItems` state.',
          'Compute `const visible = items.filter(...)` in the render body.',
        ],
        solutionCode: `import { useState } from 'react';

export function FilteredNodes({ initialItems }: { initialItems: string[] }) {
  const [items] = useState(initialItems);
  const [search, setSearch] = useState('');

  const visible = items.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      <ul>{visible.map((v) => <li key={v}>{v}</li>)}</ul>
    </>
  );
}`,
      },
      quickCheck: [
        {
          id: 'qc-03-2-a',
          question: 'Why store `selectedId: string | null` instead of `selectedItem: Item | null` in state?',
          options: [
            'If `items` updates from the server or parent, deriving `items.find(x => x.id === selectedId)` always stays fresh.',
            'Objects cannot be stored in `useState`.',
          ],
          correctIndex: 0,
          explanation: 'Storing the ID keeps `items` as the single source of truth and prevents stale object copies.',
        },
      ],
      docs: [
        { label: 'React.dev — Sharing State Between Components', url: 'https://react.dev/learn/sharing-state-between-components' },
        { label: 'React.dev — Choosing the State Structure', url: 'https://react.dev/learn/choosing-the-state-structure' },
      ],
    },
    {
      id: 'usereducer-complex-state',
      index: '03.3',
      title: '`useReducer` for Complex State',
      summary: 'Centralize multi-field transitions and discriminated actions into pure, testable reducer functions.',
      estimatedMinutes: 18,
      difficulty: 'Intermediate',
      tags: ['useReducer', 'State Machine', 'Discriminated Actions'],
      mentalModel: {
        paragraphs: [
          'When multiple state fields always transition together (e.g., `openTabs`, `activeTab`, and `history`) or when next state depends on complex rules, scattering five `set*` calls across handlers leads to inconsistent intermediate states.',
          '`useReducer(reducer, initialState)` models state transitions as a pure function `(state, action) => nextState`. Components simply `dispatch({ type: "CLOSE_TAB", id })`—separating WHAT happened from HOW state updates.',
        ],
        takeaways: [
          'Reducers must be pure: no `fetch`, no `localStorage`, and no mutating `state` directly.',
          'Type actions with a TypeScript discriminated union for exhaustive `switch` checking.',
          'Passing `dispatch` down via Context is stable forever (its identity never changes across renders).',
        ],
      },
      codeDeck: {
        filename: 'tabsReducer.ts',
        language: 'tsx',
        code: `export interface TabsState {
  openIds: string[];
  activeId: string | null;
}

export type TabsAction =
  | { type: 'OPEN'; id: string }
  | { type: 'CLOSE'; id: string }
  | { type: 'RESET' };

export function tabsReducer(state: TabsState, action: TabsAction): TabsState {
  switch (action.type) {
    case 'OPEN': {
      const openIds = state.openIds.includes(action.id)
        ? state.openIds
        : [...state.openIds, action.id];
      return { openIds, activeId: action.id };
    }
    case 'CLOSE': {
      const openIds = state.openIds.filter((id) => id !== action.id);
      const activeId =
        state.activeId === action.id ? (openIds.at(-1) ?? null) : state.activeId;
      return { openIds, activeId };
    }
    case 'RESET':
      return { openIds: [], activeId: null };
  }
}`,
        pitfall: 'Writing `state.openIds.push(action.id); return state;` returns the same object reference so React skips the re-render.',
        proTip: 'Unit-testing a reducer requires zero DOM or React rendering—just call `tabsReducer(prev, action)` directly!',
      },
      miniChallenge: {
        prompt: 'Add a `{ type: "CLOSE_OTHERS"; keepId: string }` action to `tabsReducer` that keeps only `keepId` (if it is open) and sets it active.',
        hints: [
          'Extend the `TabsAction` union.',
          'Filter `state.openIds` to just `keepId`.',
        ],
        solutionCode: `type ExtendedAction = TabsAction | { type: 'CLOSE_OTHERS'; keepId: string };

export function extendedReducer(state: TabsState, action: ExtendedAction): TabsState {
  if (action.type === 'CLOSE_OTHERS') {
    const exists = state.openIds.includes(action.keepId);
    return exists
      ? { openIds: [action.keepId], activeId: action.keepId }
      : { openIds: [], activeId: null };
  }
  return tabsReducer(state, action);
}`,
      },
      quickCheck: [
        {
          id: 'qc-03-3-a',
          question: 'Why is `dispatch` from `useReducer` safe to omit or trust in dependency arrays?',
          options: [
            'React guarantees `dispatch` keeps a stable function identity across re-renders.',
            '`dispatch` mutates state synchronously without scheduling renders.',
          ],
          correctIndex: 0,
          explanation: 'Like `setState`, `dispatch` is stable for the entire lifetime of the component instance.',
        },
      ],
      docs: [
        { label: 'React.dev — Extracting State Logic into a Reducer', url: 'https://react.dev/learn/extracting-state-logic-into-a-reducer' },
        { label: 'React.dev — Scaling Up with Reducer and Context', url: 'https://react.dev/learn/scaling-up-with-reducer-and-context' },
      ],
    },
    {
      id: 'useref-dom-escape-hatches',
      index: '03.4',
      title: '`useRef` & DOM Escape Hatches',
      summary: 'Store mutable values without triggering re-renders and interact imperatively with DOM nodes.',
      estimatedMinutes: 15,
      difficulty: 'Core',
      tags: ['useRef', 'DOM Refs', 'Animation'],
      mentalModel: {
        paragraphs: [
          '`useRef(initialValue)` returns a persistent `{ current: initialValue }` box whose identity survives across renders. Unlike `useState`, mutating `ref.current` does NOT schedule a re-render.',
          'Refs serve two distinct jobs: (1) holding non-visual mutable data like `requestAnimationFrame` IDs, timer handles, or lerp coordinates; and (2) holding a DOM element reference (`<canvas ref={canvasRef} />`) for focusing, scrolling, or imperative 2D/3D drawing.',
        ],
        takeaways: [
          'Never read or write `ref.current` during render (except lazy one-time initialization)—do it in effects or event handlers.',
          'Type DOM refs with `useRef<HTMLCanvasElement>(null)` and null-check before accessing DOM methods.',
          'In React 19, `ref` cleanup functions can be returned directly from callback refs (`ref={(node) => { ... return () => cleanup(); }}`).',
        ],
      },
      codeDeck: {
        filename: 'AutoFocusSearch.tsx',
        language: 'tsx',
        code: `import { useEffect, useRef } from 'react';

export function AutoFocusSearch() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Runs after commit when inputRef.current points to the mounted <input>
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return <input ref={inputRef} placeholder="Press Ctrl+K to focus..." />;
}`,
        pitfall: 'Using `ref.current` inside JSX like `<span>{countRef.current}</span>` shows stale numbers because changing `.current` never triggers a render.',
        proTip: 'For 60fps cursor tracking (`CharacterRig`), store `{ targetX, targetY, currentX, currentY }` in a `useRef` and update `el.style.transform` inside `requestAnimationFrame`—zero React re-renders!',
      },
      miniChallenge: {
        prompt: 'Write a `ScrollTarget` component with a button that smoothly scrolls a specific `<section ref={targetRef}>` into view.',
        hints: [
          'Create `const sectionRef = useRef<HTMLElement>(null)`.',
          'Call `sectionRef.current?.scrollIntoView({ behavior: "smooth" })` on click.',
        ],
        solutionCode: `import { useRef } from 'react';

export function ScrollTarget() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <div>
      <button
        type="button"
        onClick={() => sectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
      >
        JUMP TO NODE
      </button>
      <section ref={sectionRef}>Target Section</section>
    </div>
  );
}`,
      },
      quickCheck: [
        {
          id: 'qc-03-4-a',
          question: 'When should you choose `useRef` over `useState`?',
          options: [
            'When the value drives what is rendered in JSX.',
            'When the value is needed by effects, timers, or imperative DOM/canvas loops and should NOT re-render the component on change.',
          ],
          correctIndex: 1,
          explanation: 'If JSX reads it, use `useState`; if only imperative callbacks or animations read it, use `useRef`.',
        },
      ],
      docs: [
        { label: 'React.dev — Referencing Values with Refs', url: 'https://react.dev/learn/referencing-values-with-refs' },
        { label: 'React.dev — Manipulating the DOM with Refs', url: 'https://react.dev/learn/manipulating-the-dom-with-refs' },
      ],
    },
    {
      id: 'rules-of-hooks-closures',
      index: '03.5',
      title: 'Rules of Hooks & Closure Traps',
      summary: 'Understand why hooks must execute unconditionally at top level and how stale closures happen.',
      estimatedMinutes: 16,
      difficulty: 'Intermediate',
      tags: ['Rules of Hooks', 'Closures', 'Stale State'],
      mentalModel: {
        paragraphs: [
          'Internally, React tracks hooks per Fiber node as a singly linked list indexed by call order. Calling a hook inside an `if`, loop, or after an early `return` shifts that call order on later renders and corrupts state slots.',
          'Because every render is its own function invocation, callbacks and `setTimeout`s created in render #1 close over render #1’s variables. If an interval reads `count` directly instead of using `setCount(c => c + 1)`, it stays trapped reading `0` forever.',
        ],
        takeaways: [
          'Only call hooks at the top level of React function components or custom `use*` hooks.',
          'Put early returns AFTER all hook calls, never before.',
          'Fix stale closures in timers/listeners by using functional state updaters (`c => c + 1`), refs, or complete effect dependencies.',
        ],
      },
      codeDeck: {
        filename: 'LiveTimer.tsx',
        language: 'tsx',
        code: `import { useEffect, useState } from 'react';

export function LiveTimer({ running }: { running: boolean }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      // Functional updater avoids closing over a stale \`seconds\` snapshot
      setSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  return <span className="timer">{seconds}s</span>;
}`,
        pitfall: 'Writing `if (!open) return null;` BEFORE `useState` or `useEffect` violates the Rules of Hooks and crashes on toggle.',
        proTip: 'Enable `eslint-plugin-react-hooks` (`rules-of-hooks` and `exhaustive-deps`) in every real workspace.',
      },
      miniChallenge: {
        prompt: 'Spot and fix the two bugs in: `function Panel({ show }) { if (!show) return null; const [n, setN] = useState(0); useEffect(() => { setInterval(() => setN(n + 1), 1000); }, []); return <div>{n}</div>; }`',
        hints: [
          'Move the early return below all hooks.',
          'Use functional updater + cleanup in `useEffect`.',
        ],
        solutionCode: `import { useEffect, useState } from 'react';

export function Panel({ show }: { show: boolean }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!show) return;
    const id = window.setInterval(() => setN((prev) => prev + 1), 1000);
    return () => window.clearInterval(id);
  }, [show]);

  if (!show) return null;
  return <div>{n}</div>;
}`,
      },
      quickCheck: [
        {
          id: 'qc-03-5-a',
          question: 'Why does React forbid calling `useState` inside an `if` block?',
          options: [
            'Hooks rely on consistent call order across every render to match each hook to its Fiber state slot.',
            'JavaScript forbids closures inside `if` statements.',
          ],
          correctIndex: 0,
          explanation: 'React identifies hooks by their call index during render, not by variable name.',
        },
      ],
      docs: [
        { label: 'React.dev — Rules of Hooks', url: 'https://react.dev/reference/rules/rules-of-hooks' },
      ],
    },
  ],
};
