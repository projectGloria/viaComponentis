import type { RoadmapSection } from '../types';

export const section06: RoadmapSection = {
  id: 'performance-modern-react',
  index: '06',
  title: 'Performance & Modern React',
  subtitle: 'Profiling render costs, surgical memoization, concurrent transitions, React 19 Actions, and testing patterns.',
  topics: [
    {
      id: 'profiling-reconciliation-costs',
      index: '06.1',
      title: 'Profiling & Reconciliation Costs',
      summary: 'Measure real render bottlenecks with React DevTools Profiler before adding premature optimizations.',
      estimatedMinutes: 15,
      difficulty: 'Intermediate',
      tags: ['Profiler', 'Performance', 'Re-renders'],
      mentalModel: {
        paragraphs: [
          'Re-rendering a lightweight component takes microseconds; optimizing a fast component wastes complexity. Real slowdowns come from: (1) high-frequency updates (mouse move, typing) re-rendering huge lists/charts, (2) expensive synchronous calculations inside render, or (3) layout thrashing.',
          'Before wrapping anything in `memo`, try **structural fixes** first: move fast-changing state down into a small leaf component, pass heavy subtrees as `children`, or drive 60fps canvas/transform animations directly via refs.',
        ],
        takeaways: [
          'Always profile production builds (dev + StrictMode double-renders and checks add artificial overhead).',
          'Moving state down to the leaf that actually uses it isolates re-renders with zero `useMemo` boilerplate.',
          'Virtualize lists exceeding ~200 complex rows rather than rendering thousands of DOM nodes at once.',
        ],
      },
      codeDeck: {
        filename: 'PushStateDown.tsx',
        language: 'tsx',
        code: `import { useState } from 'react';

function LivePointerReadout() {
  // Moving fast state into this leaf prevents HeavyMatrix from re-rendering!
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  return (
    <div onMouseMove={(e) => setCoords({ x: e.clientX, y: e.clientY })}>
      CURSOR :: {coords.x}, {coords.y}
    </div>
  );
}

export function TelemetryShell({ heavyChart }: { heavyChart: React.ReactNode }) {
  return (
    <div>
      <LivePointerReadout />
      {heavyChart}
    </div>
  );
}`,
        pitfall: 'Keeping hover/tooltip/mouse state at the top of `<App />` forces the entire application tree to re-render on every mouse event.',
        proTip: 'React DevTools "Highlight updates when components render" immediately exposes trees flashing unnecessarily.',
      },
      miniChallenge: {
        prompt: 'Explain two zero-`memo` structural refactors that stop `<LargeTable />` from re-rendering when a search input or clock ticks in the same parent.',
        hints: [
          'Think about moving the ticking state into `<Clock />`.',
          'Think about passing `<LargeTable />` via `children`.',
        ],
        solutionCode: `// 1) Move fast state down into <Clock /> leaf
// 2) Lift <LargeTable /> above the stateful shell and pass it as children
export function Clock() {
  return <time>{new Date().toLocaleTimeString()}</time>;
}`,
      },
      quickCheck: [
        {
          id: 'qc-06-1-a',
          question: 'What should you usually try BEFORE wrapping components in `React.memo`?',
          options: [
            'Move fast-changing state down into smaller leaf components or compose heavy trees via `children`.',
            'Wrap every single HTML `<div>` in `useMemo`.',
          ],
          correctIndex: 0,
          explanation: 'Structural state isolation removes unnecessary re-renders cleanly without dependency-array maintenance.',
        },
      ],
      docs: [
        { label: 'React.dev — Profiler Component', url: 'https://react.dev/reference/react/Profiler' },
      ],
    },
    {
      id: 'memo-usememo-usecallback',
      index: '06.2',
      title: 'Memoization: `memo`, `useMemo` & `useCallback`',
      summary: 'Apply memoization surgically where referential stability or expensive computation genuinely matters.',
      estimatedMinutes: 17,
      difficulty: 'Advanced',
      tags: ['memo', 'useMemo', 'useCallback'],
      mentalModel: {
        paragraphs: [
          '`useMemo(() => compute(a, b), [a, b])` caches a derived value between renders; `useCallback(fn, deps)` is just `useMemo(() => fn, deps)` for functions. Neither prevents a component from re-rendering on its own—they preserve reference equality.',
          '`React.memo(Child)` skips re-rendering `Child` when all its props match shallowly via `Object.is`. Passing an un-memoized inline callback `onClick={() => ...}` or object literal `style={{...}}` to a `memo`-wrapped child breaks its cache unless stabilized with `useCallback`/`useMemo`.',
        ],
        takeaways: [
          'Use `useMemo` when a calculation takes noticeable time (>1ms) OR when keeping an object/array reference stable for a `useEffect` or `memo` child.',
          'Never wrap trivial expressions (`a + b`) in `useMemo`—the hook + dependency check costs more than the math.',
          'React Compiler (auto-memoization) automates much of this in modern pipelines, so keep components pure and rule-compliant.',
        ],
      },
      codeDeck: {
        filename: 'MemoizedGraph.tsx',
        language: 'tsx',
        code: `import { memo, useCallback, useMemo, useState } from 'react';

interface NodeListProps {
  nodes: string[];
  onSelect: (id: string) => void;
}

const HeavyNodeList = memo(function HeavyNodeList({ nodes, onSelect }: NodeListProps) {
  return (
    <ul>
      {nodes.map((id) => (
        <li key={id} onClick={() => onSelect(id)}>{id}</li>
      ))}
    </ul>
  );
});

export function GraphWorkspace({ rawNodes }: { rawNodes: string[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const sorted = useMemo(() => rawNodes.toSorted(), [rawNodes]);
  const handleSelect = useCallback((id: string) => setSelected(id), []);

  return (
    <div>
      <p>Selected: {selected ?? 'NONE'}</p>
      <HeavyNodeList nodes={sorted} onSelect={handleSelect} />
    </div>
  );
}`,
        pitfall: 'Wrapping `<HeavyNodeList>` in `memo` while passing `nodes={rawNodes.filter(...)}` defeats `memo` completely because `.filter()` allocates a new array every render.',
        proTip: 'Check if `useCallback` is actually paired with a `memo` child or `useEffect` dependency—otherwise it is dead weight.',
      },
      miniChallenge: {
        prompt: 'Identify why `const MemoRow = memo(Row)` still re-renders every time the parent renders `<MemoRow item={item} meta={{ active: true }} />`.',
        hints: [
          'Check how `Object.is` compares `{ active: true }` across two renders.',
          'Inline object literals create a new reference each render.',
        ],
        solutionCode: `// Fix: pass primitive prop \`active={true}\` instead of inline object \`meta={{ active: true }}\`
// or hoist/memoize the constant object outside the component:
const ACTIVE_META = { active: true } as const;`,
      },
      quickCheck: [
        {
          id: 'qc-06-2-a',
          question: 'When does `useCallback(fn, deps)` actually improve performance?',
          options: [
            'Every single time a component defines an `onClick` handler.',
            'When `fn` is passed to a `React.memo`-wrapped child or included in a `useEffect` dependency array.',
          ],
          correctIndex: 1,
          explanation: 'JavaScript allocates small closures cheaply; `useCallback` only helps when preserving reference identity prevents downstream work.',
        },
      ],
      docs: [
        { label: 'React.dev — useMemo', url: 'https://react.dev/reference/react/useMemo' },
        { label: 'React.dev — useCallback', url: 'https://react.dev/reference/react/useCallback' },
        { label: 'React.dev — memo', url: 'https://react.dev/reference/react/memo' },
      ],
    },
    {
      id: 'transitions-usedeferredvalue',
      index: '06.3',
      title: 'Transitions & `useDeferredValue`',
      summary: 'Keep typing and clicks 60fps responsive during heavy filter renders with Concurrent Transitions.',
      estimatedMinutes: 16,
      difficulty: 'Advanced',
      tags: ['useTransition', 'useDeferredValue', 'Concurrency'],
      mentalModel: {
        paragraphs: [
          'Not all state updates are equally urgent. Updating the `<input>` text as the user types MUST feel instant, whereas re-filtering and rendering 1,000 heavy roadmap nodes below can yield if the user presses another key.',
          '`startTransition(() => setFilter(next))` marks a state update as non-urgent and interruptible. When you don’t own the setter (e.g., receiving `query` as a prop), `const deferredQuery = useDeferredValue(query)` creates a lagging version that updates at transition priority.',
        ],
        takeaways: [
          'Use `useTransition()` (`[isPending, startTransition]`) to keep urgent input controls snappy and show subtle pending feedback.',
          'Never wrap controlled `<input>` value updates inside `startTransition`—only wrap the slow downstream state.',
          'Transitions can even wrap async actions in React 19, keeping `isPending` true until the async transition settles.',
        ],
      },
      codeDeck: {
        filename: 'DeferredFilter.tsx',
        language: 'tsx',
        code: `import { useDeferredValue, useMemo, useState } from 'react';

export function DeferredFilter({ items }: { items: string[] }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  const matches = useMemo(() => {
    const q = deferredQuery.toLowerCase();
    return items.filter((item) => item.toLowerCase().includes(q));
  }, [items, deferredQuery]);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <div style={{ opacity: isStale ? 0.65 : 1 }}>
        {matches.map((m) => <div key={m}>{m}</div>)}
      </div>
    </div>
  );
}`,
        pitfall: 'Putting `setQuery(e.target.value)` inside `startTransition` makes typing feel laggy or drop characters.',
        proTip: 'Compare `query !== deferredQuery` to dim stale list results smoothly without flashing a jarring loading spinner.',
      },
      miniChallenge: {
        prompt: 'Write a tab switcher using `useTransition` that shows `"SWITCHING..."` via `isPending` while switching to a heavy tab.',
        hints: [
          'Call `const [isPending, startTransition] = useTransition();`.',
          'Wrap `setActiveTab(nextId)` inside `startTransition`.',
        ],
        solutionCode: `import { useState, useTransition } from 'react';

export function HeavyTabSwitcher() {
  const [tab, setTab] = useState('roadmap');
  const [isPending, startTransition] = useTransition();

  function selectTab(next: string) {
    startTransition(() => setTab(next));
  }

  return (
    <div>
      <button type="button" onClick={() => selectTab('analytics')}>
        ANALYTICS {isPending ? '...' : ''}
      </button>
      <span>Active: {tab}</span>
    </div>
  );
}`,
      },
      quickCheck: [
        {
          id: 'qc-06-3-a',
          question: 'What happens if a user types another character while a `startTransition` render is still running?',
          options: [
            'The browser freezes until the slow render finishes.',
            'React interrupts the low-priority transition render to process the urgent keystroke immediately, then restarts the transition with the latest value.',
          ],
          correctIndex: 1,
          explanation: 'Interruptible rendering keeps urgent user input responsive even during heavy UI updates.',
        },
      ],
      docs: [
        { label: 'React.dev — useTransition', url: 'https://react.dev/reference/react/useTransition' },
        { label: 'React.dev — useDeferredValue', url: 'https://react.dev/reference/react/useDeferredValue' },
      ],
    },
    {
      id: 'react19-actions-optimistic',
      index: '06.4',
      title: 'React 19 Form Actions & `useOptimistic`',
      summary: 'Handle async submissions, pending states, and instant optimistic UI updates with React 19 primitives.',
      estimatedMinutes: 17,
      difficulty: 'Advanced',
      tags: ['React 19', 'useActionState', 'useOptimistic'],
      mentalModel: {
        paragraphs: [
          'React 19 introduces native support for async functions in `<form action={fn}>` and `useActionState(action, initialState)`. Instead of manually wiring `isSubmitting`, `error`, and `try/catch` boilerplate for every form, `useActionState` tracks `[state, formAction, isPending]` automatically and resets uncontrolled form inputs on success.',
          '`useOptimistic(serverState, updateFn)` lets you render the expected success state immediately while an async mutation is in flight—and automatically rolls back cleanly if the server request rejects or completes.',
        ],
        takeaways: [
          '`useActionState` returns `[state, dispatchAction, isPending]` and integrates directly with `<form action={dispatchAction}>`.',
          '`useOptimistic` only lives during an active Transition/Action and automatically reconciles back to real truth when done.',
          'Always show clear feedback and rollback behavior if an optimistic mutation fails.',
        ],
      },
      codeDeck: {
        filename: 'OptimisticStatus.tsx',
        language: 'tsx',
        code: `import { useActionState, useOptimistic } from 'react';

interface FormResult {
  error: string | null;
}

export function NoteActionForm({
  savedNote,
  onSaveRemote,
}: {
  savedNote: string;
  onSaveRemote: (text: string) => Promise<void>;
}) {
  const [optimisticNote, setOptimisticNote] = useOptimistic(savedNote);

  const [result, submitAction, isPending] = useActionState<FormResult, FormData>(
    async (_prev, formData) => {
      const next = String(formData.get('note') ?? '').trim();
      if (!next) return { error: 'Note cannot be empty.' };
      setOptimisticNote(next);
      try {
        await onSaveRemote(next);
        return { error: null };
      } catch (e) {
        return { error: (e as Error).message };
      }
    },
    { error: null }
  );

  return (
    <form action={submitAction}>
      <p>Preview: {optimisticNote}</p>
      <input name="note" defaultValue={savedNote} />
      <button type="submit" disabled={isPending}>
        {isPending ? 'SYNCING...' : 'COMMIT NOTE'}
      </button>
      {result.error ? <p>{result.error}</p> : null}
    </form>
  );
}`,
        pitfall: 'Calling `setOptimisticNote` outside a Transition or Form Action triggers a React warning because optimistic state needs an async boundary to settle.',
        proTip: 'Use `useFormStatus()` inside reusable submit button components nested in any `<form action={...}>` to read `pending` without prop drilling.',
      },
      miniChallenge: {
        prompt: 'Write a reusable `<SubmitButton label="SAVE" />` using `useFormStatus()` from `react-dom` that disables itself while its parent form is submitting.',
        hints: [
          'Import `useFormStatus` from `"react-dom"`.',
          'Read `const { pending } = useFormStatus();`.',
        ],
        solutionCode: `import { useFormStatus } from 'react-dom';

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'PROCESSING...' : label}
    </button>
  );
}`,
      },
      quickCheck: [
        {
          id: 'qc-06-4-a',
          question: 'What happens to `useOptimistic` state once its enclosing async action finishes?',
          options: [
            'It stays permanently locked until you manually reset it.',
            'React discards the temporary optimistic overlay and displays the real underlying state passed as the first argument.',
          ],
          correctIndex: 1,
          explanation: 'Optimistic state is temporary during the async transition; once settled, React falls back to the authoritative state.',
        },
      ],
      docs: [
        { label: 'React.dev — useActionState', url: 'https://react.dev/reference/react/useActionState' },
        { label: 'React.dev — useOptimistic', url: 'https://react.dev/reference/react/useOptimistic' },
      ],
    },
    {
      id: 'testing-production-patterns',
      index: '06.5',
      title: 'Testing & Production Patterns',
      summary: 'Test components by user behavior with Vitest + Testing Library and harden production builds.',
      estimatedMinutes: 16,
      difficulty: 'Intermediate',
      tags: ['Testing Library', 'Vitest', 'Accessibility'],
      mentalModel: {
        paragraphs: [
          'Test React components the way a user interacts with them—query by accessible role, label, or visible text (`getByRole("button", { name: /mastered/i })`), fire real `userEvent` clicks/typing, and assert visible DOM outcomes rather than internal state or CSS class names.',
          'In production, combine accessible semantic HTML (`<button>`, `<nav>`, `aria-selected`, keyboard navigation), strict TypeScript checks (`tsc --noEmit`), and clean bundle splitting so your desktop or web app stays reliable under refactoring.',
        ],
        takeaways: [
          'Prefer `getByRole` > `getByLabelText` > `getByText` over brittle `data-testid` or CSS selectors.',
          'Extract pure domain logic (reducers, tokenizers, persistence validators) so they can be unit-tested in milliseconds with zero DOM.',
          'Ensure every interactive control works via keyboard (`Tab`, `Enter`, `Space`, `Escape`) and exposes clear `:focus-visible` outlines.',
        ],
      },
      codeDeck: {
        filename: 'StatusToggle.test.tsx',
        language: 'tsx',
        code: `// Example Vitest + @testing-library/react test pattern:
// import { render, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import { describe, expect, it, vi } from 'vitest';

export async function verifyToggleBehavior(
  renderFn: () => void,
  clickToggle: () => Promise<void>,
  expectMasteredVisible: () => void
) {
  renderFn();
  await clickToggle();
  expectMasteredVisible();
}

// Accessible pattern being tested:
export function StatusButton({ mastered, onToggle }: { mastered: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={mastered}
      onClick={onToggle}
    >
      {mastered ? 'MASTERED' : 'MARK MASTERED'}
    </button>
  );
}`,
        pitfall: 'Asserting on private component internals or snapshot-testing giant HTML blobs creates brittle tests that break on harmless styling edits.',
        proTip: 'If a component is hard to query with `getByRole` in a test, that is a strong signal its accessibility semantics need improvement!',
      },
      miniChallenge: {
        prompt: 'Make a custom clickable topic row accessible to keyboard users without turning the entire row into an invalid nested `<button>` inside a `<button>`.',
        hints: [
          'Use a `<div role="button" tabIndex={0}>` or make the title itself a `<button>` while keeping the status toggle as a sibling `<button>`.',
          'Handle `onKeyDown` for `Enter` and `Space` if using `role="button"`.',
        ],
        solutionCode: `export function AccessibleTopicRow({
  title,
  onOpen,
  onToggleStatus,
}: {
  title: string;
  onOpen: () => void;
  onToggleStatus: () => void;
}) {
  return (
    <article className="hud-card">
      <button type="button" onClick={onOpen}>{title}</button>
      <button type="button" onClick={onToggleStatus}>STATUS</button>
    </article>
  );
}`,
      },
      quickCheck: [
        {
          id: 'qc-06-5-a',
          question: 'Why does React Testing Library recommend `getByRole` over `querySelector(".btn-primary")`?',
          options: [
            '`getByRole` verifies both visible behavior AND accessibility semantics simultaneously.',
            '`querySelector` does not work in browsers.',
          ],
          correctIndex: 0,
          explanation: 'Role-based queries ensure buttons, headings, and tabs are semantically accessible to screen readers and keyboard users.',
        },
      ],
      docs: [
        { label: 'React.dev — Testing Overview', url: 'https://react.dev/learn' },
      ],
    },
  ],
};
