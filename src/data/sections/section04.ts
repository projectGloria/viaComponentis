import type { RoadmapSection } from '../types';

export const section04: RoadmapSection = {
  id: 'effects-sync-lifecycle',
  index: '04',
  title: 'Effects, Sync & Lifecycle',
  subtitle: 'Synchronizing external systems with `useEffect`, avoiding unnecessary effects, custom hooks, and `useLayoutEffect`.',
  topics: [
    {
      id: 'useeffect-mental-model-cleanup',
      index: '04.1',
      title: '`useEffect` Mental Model & Cleanup',
      summary: 'Think in synchronization cycles—setup, cleanup, and reactive dependencies—instead of mount/unmount.',
      estimatedMinutes: 18,
      difficulty: 'Intermediate',
      tags: ['useEffect', 'Cleanup', 'AbortController'],
      mentalModel: {
        paragraphs: [
          '`useEffect` is NOT a lifecycle wrapper for `componentDidMount`—it is a synchronization mechanism that connects your React component to an external system (timers, WebSockets, DOM listeners, network subscriptions).',
          'Every time a reactive value listed in the dependency array changes, React runs the previous effect’s cleanup function first, then runs the new setup function. In development, `<StrictMode>` mounts, runs cleanup, and re-runs setup once to prove your cleanup actually undoes your setup.',
        ],
        takeaways: [
          'Include every reactive prop, state, or component-body function read inside the effect in its dependency array.',
          'Always return a cleanup function for listeners, intervals, subscriptions, or `AbortController.abort()`.',
          'Do not lie to the dependency array—if a dependency triggers too often, move non-reactive logic out or stabilize it cleanly.',
        ],
      },
      codeDeck: {
        filename: 'useNodeStream.tsx',
        language: 'tsx',
        code: `import { useEffect, useState } from 'react';

export function useNodeStream(nodeId: string) {
  const [payload, setPayload] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch(\`/api/nodes/\${nodeId}\`, { signal: controller.signal });
        const text = await res.text();
        setPayload(text);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setPayload('SYNC_ERROR');
        }
      }
    }

    void load();
    // Cleanup aborts stale in-flight requests if nodeId changes rapidly
    return () => controller.abort();
  }, [nodeId]);

  return payload;
}`,
        pitfall: 'Fetching inside `useEffect` without an `AbortController` or `ignore` flag causes race conditions when an older slow request overwrites a newer request.',
        proTip: 'If your effect fails React StrictMode double-invoke in dev, you caught a real cleanup bug before production!',
      },
      miniChallenge: {
        prompt: 'Write a `useWindowKey(key: string, handler: () => void)` effect that attaches a `keydown` listener and cleans it up cleanly.',
        hints: [
          'Call `window.addEventListener("keydown", onKeyDown)` inside `useEffect`.',
          'Return `() => window.removeEventListener("keydown", onKeyDown)`.',
        ],
        solutionCode: `import { useEffect } from 'react';

export function useWindowKey(targetKey: string, onTrigger: () => void) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === targetKey) onTrigger();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [targetKey, onTrigger]);
}`,
      },
      quickCheck: [
        {
          id: 'qc-04-1-a',
          question: 'When does `useEffect`’s cleanup function execute?',
          options: [
            'Only when the component unmounts from the DOM.',
            'Before every re-run of that effect when dependencies change, AND when the component unmounts.',
          ],
          correctIndex: 1,
          explanation: 'Cleanup runs before re-synchronizing with new dependencies as well as on final unmount.',
        },
      ],
      docs: [
        { label: 'React.dev — Synchronizing with Effects', url: 'https://react.dev/learn/synchronizing-with-effects' },
        { label: 'React.dev — Lifecycle of Reactive Effects', url: 'https://react.dev/learn/lifecycle-of-reactive-effects' },
      ],
    },
    {
      id: 'when-you-dont-need-an-effect',
      index: '04.2',
      title: 'When You Don’t Need an Effect',
      summary: 'Eliminate redundant `useEffect` chains for derived data, event responses, and prop-driven resets.',
      estimatedMinutes: 16,
      difficulty: 'Intermediate',
      tags: ['Anti-Patterns', 'Derived Data', 'Performance'],
      mentalModel: {
        paragraphs: [
          'Two common uses of `useEffect` are almost always bugs or wasted render passes: (1) transforming data for rendering (`useEffect(() => setFiltered(items.filter(...)), [items])`), and (2) handling user actions (`useEffect(() => { if (submitted) postForm(); }, [submitted])`).',
          'Transforming props/state belongs inline during render (or `useMemo` if genuinely heavy). User-initiated actions belong in the event handler where the click or submit happened. Resetting all child state when an ID prop changes is a one-line `key={id}` on the child.',
        ],
        takeaways: [
          'Never use `useEffect` to sync one React state variable from another—calculate it during render.',
          'Never trigger `POST` mutations from an effect watching a boolean flag—run them directly inside `onSubmit` / `onClick`.',
          'Pass `key={topicId}` to reset an entire component tree cleanly instead of writing a `useEffect` that clears 5 states.',
        ],
      },
      codeDeck: {
        filename: 'NoEffectNeeded.tsx',
        language: 'tsx',
        code: `interface User {
  first: string;
  last: string;
}

// GOOD: zero effects, zero extra render pass
export function ProfileHeader({ user, onSave }: { user: User; onSave: (name: string) => void }) {
  const fullName = \`\${user.first} \${user.last}\`.trim();

  function handleSaveClick() {
    // Event logic runs directly in the handler, not via effect flags
    onSave(fullName);
  }

  return (
    <header>
      <h2>{fullName}</h2>
      <button type="button" onClick={handleSaveClick}>SAVE</button>
    </header>
  );
}`,
        pitfall: 'Writing `useEffect(() => setFullName(first + " " + last), [first, last])` triggers an extra stale render before updating.',
        proTip: 'Whenever you reach for `useEffect`, ask: "What external non-React system am I syncing with?" If none, you likely do not need an effect.',
      },
      miniChallenge: {
        prompt: 'Replace `const [draft, setDraft] = useState(initial); useEffect(() => setDraft(initial), [id, initial]);` in a `<NotesEditor id={id} initial={text} />` pattern.',
        hints: [
          'Keep `useState(initial)` inside `NotesEditor`.',
          'Pass `key={id}` where `<NotesEditor key={topic.id} initial={topic.notes} />` is rendered.',
        ],
        solutionCode: `import { useState } from 'react';

export function NotesEditor({ initial }: { initial: string }) {
  const [draft, setDraft] = useState(initial);
  return <textarea value={draft} onChange={(e) => setDraft(e.target.value)} />;
}

// Parent resets NotesEditor cleanly whenever topicId changes:
export function LessonNotesHost({ topicId, saved }: { topicId: string; saved: string }) {
  return <NotesEditor key={topicId} initial={saved} />;
}`,
      },
      quickCheck: [
        {
          id: 'qc-04-2-a',
          question: 'Which scenario genuinely requires `useEffect`?',
          options: [
            'Computing `totalPrice = price * qty` when `qty` changes.',
            'Subscribing to a browser `ResizeObserver` or WebSocket feed while mounted.',
            'Submitting a form when the user clicks Save.',
          ],
          correctIndex: 1,
          explanation: 'Connecting to an external browser/network subscription is what `useEffect` is designed for.',
        },
      ],
      docs: [
        { label: 'React.dev — You Might Not Need an Effect', url: 'https://react.dev/learn/you-might-not-need-an-effect' },
      ],
    },
    {
      id: 'building-custom-hooks',
      index: '04.3',
      title: 'Building Reusable Custom Hooks',
      summary: 'Extract stateful logic (`useLocalStorage`, `useDebounce`, `useMediaQuery`) into clean `use*` hooks.',
      estimatedMinutes: 17,
      difficulty: 'Intermediate',
      tags: ['Custom Hooks', 'Abstraction', 'TypeScript Generics'],
      mentalModel: {
        paragraphs: [
          'Custom hooks let you share stateful behavior—not state itself—across components. Every component calling `useDebounce(query, 250)` gets its own independent isolated state and effect lifecycle.',
          'The `use` prefix is not just naming flair: React’s linter and compiler rely on it to enforce the Rules of Hooks inside the custom hook and at its call sites. Name custom hooks after WHAT they do (`useDebouncedValue`, `useOnlineStatus`), not low-level mechanics (`useEffectInterval`).',
        ],
        takeaways: [
          'Custom hooks share stateful *logic*, never shared state values (use Context or a store to share state across components).',
          'Return either a tuple `[value, setter] as const` (easy renaming) or an object `{ data, isLoading }` (easy partial destructuring).',
          'Use TypeScript generics `<T>(value: T, delayMs: number): T` so custom hooks preserve caller types.',
        ],
      },
      codeDeck: {
        filename: 'useDebouncedValue.ts',
        language: 'tsx',
        code: `import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delayMs = 200): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(value);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}`,
        pitfall: 'Writing a helper named `getStorage()` that calls `useState` internally breaks Rules of Hooks checks because it lacks the `use` prefix.',
        proTip: 'Keep custom hooks focused on a single cohesive external concern; huge "god hooks" returning 20 fields couple unrelated re-renders.',
      },
      miniChallenge: {
        prompt: 'Write a typed `useToggle(initial = false)` custom hook returning `[value, toggle, setValue] as const` with stable callbacks.',
        hints: [
          'Use `useCallback` for `toggle` so callers can pass it to memoized children safely.',
          'Return `as const` to preserve tuple types in TypeScript.',
        ],
        solutionCode: `import { useCallback, useState } from 'react';

export function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue] as const;
}`,
      },
      quickCheck: [
        {
          id: 'qc-04-3-a',
          question: 'If `<PanelA />` and `<PanelB />` both call `useToggle(false)`, what happens when `<PanelA />` toggles?',
          options: [
            'Both `<PanelA />` and `<PanelB />` flip to `true`.',
            'Only `<PanelA />` flips to `true`; each call site owns independent state.',
          ],
          correctIndex: 1,
          explanation: 'Custom hooks reuse state logic, not the underlying state instance.',
        },
      ],
      docs: [
        { label: 'React.dev — Reusing Logic with Custom Hooks', url: 'https://react.dev/learn/reusing-logic-with-custom-hooks' },
      ],
    },
    {
      id: 'uselayouteffect-useid-external-store',
      index: '04.4',
      title: '`useLayoutEffect`, `useId` & `useSyncExternalStore`',
      summary: 'Know React’s specialized hooks for flicker-free DOM measurement, accessible IDs, and external stores.',
      estimatedMinutes: 16,
      difficulty: 'Advanced',
      tags: ['useLayoutEffect', 'useId', 'useSyncExternalStore'],
      mentalModel: {
        paragraphs: [
          '`useEffect` runs asynchronously AFTER the browser paints, keeping interactions responsive. `useLayoutEffect` runs synchronously BEFORE the browser paints—use it ONLY when you must measure DOM geometry (`getBoundingClientRect`) and reposition a tooltip/popover before the user ever sees a visual jump.',
          '`useId()` generates stable, unique IDs for `htmlFor` / `aria-describedby` pairs (never for list `key`s!). `useSyncExternalStore(subscribe, getSnapshot)` lets components safely subscribe to non-React stores like `matchMedia`, `navigator.onLine`, or Zustand without tearing.',
        ],
        takeaways: [
          'Default to `useEffect`; reach for `useLayoutEffect` solely to prevent layout flicker after DOM measurements.',
          'Use `useId()` for accessible form labels and SVG `<defs>` IDs so multiple component instances never collide.',
          'Use `useSyncExternalStore` to bridge browser APIs (`window.matchMedia`) cleanly into React.',
        ],
      },
      codeDeck: {
        filename: 'useReducedMotion.ts',
        language: 'tsx',
        code: `import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}`,
        pitfall: 'Passing `key={useId()}` inside `.map()` breaks reconciliation—`useId()` is for stable accessibility/DOM IDs, not list item keys.',
        proTip: 'Combining `useId()` with a field suffix (`const id = useId(); <label htmlFor={`${id}-email`}>`) guarantees zero duplicate IDs across modals.',
      },
      miniChallenge: {
        prompt: 'Build an accessible `<CyberField label="API Key" />` component using `useId()` to bind `<label htmlFor>` to `<input id>`.',
        hints: [
          'Call `const inputId = useId();` at the top of the component.',
          'Wire `htmlFor={inputId}` and `id={inputId}`.',
        ],
        solutionCode: `import { useId } from 'react';

export function CyberField({ label }: { label: string }) {
  const inputId = useId();
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} type="text" />
    </div>
  );
}`,
      },
      quickCheck: [
        {
          id: 'qc-04-4-a',
          question: 'When is `useLayoutEffect` preferred over `useEffect`?',
          options: [
            'For all data fetching so requests start sooner.',
            'When measuring DOM layout and applying positional updates before the browser paints to avoid a visible flicker.',
          ],
          correctIndex: 1,
          explanation: '`useLayoutEffect` blocks browser paint briefly so layout adjustments appear in a single visual frame.',
        },
      ],
      docs: [
        { label: 'React.dev — useLayoutEffect', url: 'https://react.dev/reference/react/useLayoutEffect' },
        { label: 'React.dev — useSyncExternalStore', url: 'https://react.dev/reference/react/useSyncExternalStore' },
        { label: 'React.dev — useId', url: 'https://react.dev/reference/react/useId' },
      ],
    },
  ],
};
