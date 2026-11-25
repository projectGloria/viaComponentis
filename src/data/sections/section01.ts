import type { RoadmapSection } from '../types';

export const section01: RoadmapSection = {
  id: 'getting-started',
  index: '01',
  title: 'Getting Started',
  subtitle: 'Declarative UI trees, Vite + TypeScript setup, JSX compilation rules, and list reconciliation.',
  topics: [
    {
      id: 'mental-model-reconciliation',
      index: '01.1',
      title: 'How React & Reconciliation Work',
      summary: 'Think in snapshots of UI derived from state, not manual DOM mutations.',
      estimatedMinutes: 15,
      difficulty: 'Core',
      tags: ['Virtual DOM', 'Fiber', 'Declarative UI'],
      mentalModel: {
        paragraphs: [
          'React components are pure-ish JavaScript functions that return a lightweight description of the UI (React elements). Rendering is NOT painting pixels to the screen—it is React calling your component functions to produce the next virtual UI snapshot for a given state.',
          'During reconciliation (powered by the Fiber tree), React diffs the previous element snapshot against the new one by element type and `key`. Only the minimal DOM mutations needed to match the new snapshot are applied during the commit phase.',
        ],
        takeaways: [
          'UI = f(state): describe what the screen should look like now, never how to transition between two states.',
          'A re-render only computes a new React element tree; unchanged DOM nodes are preserved.',
          'Changing an element type (e.g. `<div>` to `<section>`) unmounts the entire subtree and resets its state.',
        ],
      },
      codeDeck: {
        filename: 'NodeSnapshot.tsx',
        language: 'tsx',
        code: `interface NodeSnapshotProps {
  name: string;
  latencyMs: number;
}

export function NodeSnapshot({ name, latencyMs }: NodeSnapshotProps) {
  // React computes a fresh UI snapshot whenever props or state change
  return (
    <section className="hud-panel">
      <h3>{name}</h3>
      <p>Telemetry ping: {latencyMs} ms</p>
    </section>
  );
}`,
        pitfall: 'Mutating DOM nodes manually with `document.querySelector` fights React reconciliation and causes stale UI on the next render.',
        proTip: 'If a component function has zero side effects during render, React StrictMode can double-invoke it in dev to verify purity.',
      },
      miniChallenge: {
        prompt: 'Build a pure declarative `ModuleCard` component taking `{ title: string; version: string }` that renders a `<section>` containing an `<h2>` title and a `<p>` showing `v{version}` without any local state or conditionals.',
        hints: [
          'Destructure `{ title, version }` directly in the component parameter list.',
          'Embed both values directly in JSX with `{title}` and `v{version}`.',
        ],
        solutionCode: `interface ModuleCardProps {
  title: string;
  version: string;
}

export function ModuleCard({ title, version }: ModuleCardProps) {
  // Pure declarative snapshot derived directly from props
  return (
    <section className="module-card">
      <h2>{title}</h2>
      <p>v{version}</p>
    </section>
  );
}`,
      },
      quickCheck: [
        {
          id: 'qc-01-1-a',
          question: 'When React re-renders a component, what happens immediately?',
          options: [
            'The entire browser DOM inside that component is destroyed and recreated.',
            'React calls the component function to compute a new element tree and diffs it against the previous tree.',
            'All local `useState` values inside the component reset to their initial values.',
          ],
          correctIndex: 1,
          explanation: 'Rendering computes a new React element snapshot; Fiber reconciles differences and commits only the minimal DOM updates.',
        },
        {
          id: 'qc-01-1-b',
          question: 'What happens if a parent switches from rendering `<Panel />` to `<Modal />` at the same tree position?',
          options: [
            'React preserves the internal state of `<Panel />` and copies it into `<Modal />`.',
            'React unmounts `<Panel />` (destroying its state) and mounts `<Modal />` fresh.',
          ],
          correctIndex: 1,
          explanation: 'Different component or element types at the same position trigger a full subtree unmount and remount.',
        },
      ],
      docs: [
        { label: 'React.dev — Render and Commit', url: 'https://react.dev/learn/render-and-commit' },
        { label: 'React.dev — Preserving and Resetting State', url: 'https://react.dev/learn/preserving-and-resetting-state' },
      ],
    },
    {
      id: 'vite-typescript-setup',
      index: '01.2',
      title: 'Vite, TypeScript & Project Setup',
      summary: 'Configure React 19 with strict TypeScript, JSX transform, and fast ESM HMR.',
      estimatedMinutes: 12,
      difficulty: 'Core',
      tags: ['Vite', 'tsconfig', 'React 19'],
      mentalModel: {
        paragraphs: [
          'Modern React apps drop heavy legacy bundlers in favor of Vite: native ES modules in development for sub-50ms HMR, and Rollup-powered tree-shaken bundles in production.',
          'With `"jsx": "react-jsx"` in `tsconfig.json`, TypeScript compiles JSX directly to `react/jsx-runtime` calls—you no longer need `import React from "react"` in every file. Keeping `strict: true`, `noUnusedLocals`, and `React.StrictMode` catches stale closures and impure renders early.',
        ],
        takeaways: [
          '`createRoot(container).render(<StrictMode><App /></StrictMode>)` is the standard React 19 entry point.',
          '`@types/react` v19 uses `ReactNode` for children and explicit ref/event generics.',
          'Run `tsc && vite build` so type errors block production builds (Vite itself strips types without type-checking).',
        ],
      },
      codeDeck: {
        filename: 'src/main.tsx',
        language: 'tsx',
        code: `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root mount node #root is missing from index.html');
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);`,
        pitfall: 'Running only `vite build` skips TypeScript type-checking; broken prop types will ship silently without `tsc`.',
        proTip: 'Use `import type { ReactNode } from "react"` for type-only imports so `isolatedModules` erases them cleanly.',
      },
      miniChallenge: {
        prompt: 'Write a strict `tsconfig` check and safe root bootstrap that throws a clear diagnostic if `#root` is absent instead of using the non-null `!` assertion.',
        hints: [
          'Store `document.getElementById("root")` in a constant.',
          'Narrow it with an `if (!container)` guard before calling `createRoot`.',
        ],
        solutionCode: `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Mount target #root not found');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);`,
      },
      quickCheck: [
        {
          id: 'qc-01-2-a',
          question: 'Why does `"build": "tsc && vite build"` run `tsc` before Vite?',
          options: [
            'Vite converts TypeScript using esbuild/SWC without running full type-checking.',
            'Vite cannot read `.tsx` files unless `tsc` emits `.js` files first.',
          ],
          correctIndex: 0,
          explanation: 'Vite transpiles TS syntax for speed without type-checking; `tsc --noEmit` enforces full static type safety.',
        },
      ],
      docs: [
        { label: 'React.dev — Using TypeScript', url: 'https://react.dev/learn/typescript' },
        { label: 'React.dev — Build a React App from Scratch', url: 'https://react.dev/learn/build-a-react-app-from-scratch' },
      ],
    },
    {
      id: 'jsx-rules-expressions',
      index: '01.3',
      title: 'JSX Rules & Expressions',
      summary: 'Understand JSX compilation, Fragments, camelCase DOM props, and expression slots.',
      estimatedMinutes: 12,
      difficulty: 'Core',
      tags: ['JSX', 'Fragments', 'Expressions'],
      mentalModel: {
        paragraphs: [
          'JSX is syntactic sugar for `jsx(type, props)` function calls—it is not HTML templating. Because every JSX tag compiles to an expression that returns a single object, a component must return a single root node (or wrap siblings in a Fragment `<>...</>`).',
          'Inside `{ ... }`, you can place any JavaScript expression that evaluates to a value (variables, ternary expressions, `.map()`, function calls), but not statements like `if` or `for`. Attributes map to DOM property names in camelCase (`className`, `htmlFor`, `tabIndex`, `readOnly`).',
        ],
        takeaways: [
          'Fragments (`<>...</>` or `<Fragment key={id}>`) group siblings without adding extra wrapper DOM elements.',
          'Booleans, `null`, and `undefined` render nothing in JSX, whereas the number `0` DOES render `"0"`.',
          'Inline `style` accepts a camelCased object (`style={{ opacity: 0.8 }}`), never a raw CSS string.',
        ],
      },
      codeDeck: {
        filename: 'MetricTile.tsx',
        language: 'tsx',
        code: `interface MetricTileProps {
  label: string;
  count: number;
  hint?: string;
}

export function MetricTile({ label, count, hint }: MetricTileProps) {
  return (
    <>
      <dt>{label}</dt>
      <dd>
        <span>{count}</span>
        {/* Guard numeric/falsy conditions explicitly with booleans */}
        {count > 0 && hint ? <small> — {hint}</small> : null}
      </dd>
    </>
  );
}`,
        pitfall: 'Writing `{items.length && <List />}` renders a literal `"0"` on screen when `items` is empty!',
        proTip: 'Always coerce counts into booleans (`items.length > 0 && <List />`) or use a ternary (`? <List /> : null`).',
      },
      miniChallenge: {
        prompt: 'Refactor a `<div class="card"><label for="node">Node</label><input tabindex="0"></div>` HTML snippet into valid JSX inside a Fragment.',
        hints: [
          'Close void tags like `<input />`.',
          'Convert `class`, `for`, and `tabindex` to React camelCase equivalents.',
        ],
        solutionCode: `export function NodeField() {
  return (
    <div className="card">
      <label htmlFor="node">Node</label>
      <input id="node" tabIndex={0} />
    </div>
  );
}`,
      },
      quickCheck: [
        {
          id: 'qc-01-3-a',
          question: 'What does `{0 && <span>Active</span>}` render in JSX?',
          options: [
            'Nothing at all.',
            'The text `0` inside the DOM.',
            'A runtime TypeError.',
          ],
          correctIndex: 1,
          explanation: 'JavaScript short-circuits `0 && ...` to `0`, and React renders the number `0` as text.',
        },
      ],
      docs: [
        { label: 'React.dev — Writing Markup with JSX', url: 'https://react.dev/learn/writing-markup-with-jsx' },
        { label: 'React.dev — JavaScript in JSX with Curly Braces', url: 'https://react.dev/learn/javascript-in-jsx-with-curly-braces' },
      ],
    },
    {
      id: 'conditional-list-rendering',
      index: '01.4',
      title: 'Conditional & List Rendering',
      summary: 'Master stable `key` identity, filtering/mapping arrays, and clean branching.',
      estimatedMinutes: 15,
      difficulty: 'Core',
      tags: ['Lists', 'Keys', 'Conditionals'],
      mentalModel: {
        paragraphs: [
          'Lists in React use standard array `.filter()` and `.map()` expressions inside JSX. Every top-level element returned by `.map()` requires a `key` prop that uniquely and stably identifies that item among its siblings.',
          'Keys are NOT passed to your component as a prop—they are metadata for React Fiber reconciliation. Using array indices as keys breaks component state, animations, and input focus whenever items are inserted, deleted, or reordered.',
        ],
        takeaways: [
          'Use a stable domain ID (`item.id`) as `key`, never `Math.random()` (remounts every render) and avoid array `index` for mutable lists.',
          'Return `<Fragment key={item.id}>` when a single mapped item must emit multiple sibling elements.',
          'For complex conditional branches, early-return in the component or extract a small lookup map instead of deeply nested ternaries.',
        ],
      },
      codeDeck: {
        filename: 'NodeFeed.tsx',
        language: 'tsx',
        code: `interface TelemetryItem {
  id: string;
  label: string;
  active: boolean;
}

export function NodeFeed({ items }: { items: TelemetryItem[] }) {
  if (items.length === 0) {
    return <p className="empty-state">NO ACTIVE TELEMETRY NODES</p>;
  }

  return (
    <ul className="node-feed">
      {items
        .filter((item) => item.active)
        .map((item) => (
          <li key={item.id} className="node-row">
            <span>{item.label}</span>
          </li>
        ))}
    </ul>
  );
}`,
        pitfall: 'Generating `key={crypto.randomUUID()}` inside render forces React to destroy and recreate every DOM node on every re-render.',
        proTip: 'Early returns (`if (items.length === 0) return ...`) flatten JSX indentation and make empty/loading/error states effortless to read.',
      },
      miniChallenge: {
        prompt: 'Render a glossary `<dl>` from `terms: { id: string; term: string; def: string }[]` where each item renders both `<dt>` and `<dd>` without wrapping them in a `<div>`.',
        hints: [
          'Import `Fragment` from `"react"`.',
          'Attach `key={entry.id}` directly on `<Fragment>`.',
        ],
        solutionCode: `import { Fragment } from 'react';

interface Term {
  id: string;
  term: string;
  def: string;
}

export function Glossary({ terms }: { terms: Term[] }) {
  return (
    <dl>
      {terms.map((entry) => (
        <Fragment key={entry.id}>
          <dt>{entry.term}</dt>
          <dd>{entry.def}</dd>
        </Fragment>
      ))}
    </dl>
  );
}`,
      },
      quickCheck: [
        {
          id: 'qc-01-4-a',
          question: 'Why are array indices unsafe as `key`s in editable or sortable lists?',
          options: [
            'TypeScript forbids numeric keys in `.map()`.',
            'Reordering or prepending items shifts indices, causing React to pair existing DOM/state with the wrong data item.',
          ],
          correctIndex: 1,
          explanation: 'React matches instances by `key`; if index 0 changes identity, state from the old item sticks to the new item at index 0.',
        },
      ],
      docs: [
        { label: 'React.dev — Rendering Lists', url: 'https://react.dev/learn/rendering-lists' },
        { label: 'React.dev — Conditional Rendering', url: 'https://react.dev/learn/conditional-rendering' },
      ],
    },
  ],
};
