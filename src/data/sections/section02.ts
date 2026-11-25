import type { RoadmapSection } from '../types';

export const section02: RoadmapSection = {
  id: 'components-composition',
  index: '02',
  title: 'Components & Composition',
  subtitle: 'Typed prop contracts, slot/children composition, render purity, controlled forms, and compound APIs.',
  topics: [
    {
      id: 'props-typescript-interfaces',
      index: '02.1',
      title: 'Props & TypeScript Interfaces',
      summary: 'Model strict component contracts with discriminated unions, defaults, and HTML element forwarding.',
      estimatedMinutes: 16,
      difficulty: 'Core',
      tags: ['Props', 'TypeScript', 'Discriminated Unions'],
      mentalModel: {
        paragraphs: [
          'Props are the read-only input contract passed from parent to child. Never mutate props inside a component—if a child needs local editing, derive or initialize state cleanly.',
          'In TypeScript, prefer discriminated unions over bags of optional booleans. Instead of `{ isLoading?: boolean; error?: string; data?: T }`, model `{ status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: T }` so impossible states cannot compile.',
        ],
        takeaways: [
          'Destructure props with default values directly in the parameter list: `{ variant = "ghost", ...rest }`.',
          'Extend native props cleanly using `ComponentPropsWithoutRef<"button">` when wrapping HTML elements.',
          'Discriminated unions eliminate ambiguous optional-prop combinations.',
        ],
      },
      codeDeck: {
        filename: 'CyberButton.tsx',
        language: 'tsx',
        code: `import type { ComponentPropsWithoutRef, ReactNode } from 'react';

interface CyberButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'ghost';
  icon?: ReactNode;
}

export function CyberButton({
  variant = 'ghost',
  icon,
  children,
  className = '',
  type = 'button',
  ...rest
}: CyberButtonProps) {
  return (
    <button
      type={type}
      className={\`cyber-btn cyber-btn--\${variant} \${className}\`}
      {...rest}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}`,
        pitfall: 'Omitting `type="button"` on custom button wrappers causes accidental form submissions whenever used inside a `<form>`.',
        proTip: 'In React 19, `ref` is passed as a regular prop on function components—`forwardRef` is no longer required for new code.',
      },
      miniChallenge: {
        prompt: 'Create a discriminated union `AlertProps` supporting `mode: "info"` (with `message: string`) or `mode: "confirm"` (with `message: string` and `onConfirm: () => void`).',
        hints: [
          'Define two object shapes sharing `mode` as the discriminant literal.',
          'Narrow on `props.mode === "confirm"` inside the JSX.',
        ],
        solutionCode: `type AlertProps =
  | { mode: 'info'; message: string }
  | { mode: 'confirm'; message: string; onConfirm: () => void };

export function AlertBox(props: AlertProps) {
  return (
    <div className="hud-card">
      <p>{props.message}</p>
      {props.mode === 'confirm' && (
        <button type="button" onClick={props.onConfirm}>
          CONFIRM
        </button>
      )}
    </div>
  );
}`,
      },
      quickCheck: [
        {
          id: 'qc-02-1-a',
          question: 'Why use `ComponentPropsWithoutRef<"button">` for a custom `<Button />` component?',
          options: [
            'It automatically styles the button with Tailwind.',
            'It inherits standard `<button>` attributes (`disabled`, `onClick`, `aria-*`) with full type safety.',
          ],
          correctIndex: 1,
          explanation: 'Extending `ComponentPropsWithoutRef<"button">` forwards native HTML attributes cleanly without duplicating dozens of prop types.',
        },
      ],
      docs: [
        { label: 'React.dev — Passing Props to a Component', url: 'https://react.dev/learn/passing-props-to-a-component' },
        { label: 'React.dev — TypeScript with React Components', url: 'https://react.dev/learn/typescript#typing-component-props' },
      ],
    },
    {
      id: 'children-composition-patterns',
      index: '02.2',
      title: 'Children & Composition Patterns',
      summary: 'Avoid prop drilling and bloated boolean flags by composing JSX slots and `children`.',
      estimatedMinutes: 14,
      difficulty: 'Core',
      tags: ['Composition', 'Children', 'Slots'],
      mentalModel: {
        paragraphs: [
          'React prefers composition over inheritance. A layout shell (`HudCard`, `Modal`, `SplitPane`) should not know about the domain data inside it—it simply renders `children` or named JSX slot props (`header`, `actions`, `footer`).',
          'Passing already-rendered JSX via `children` also gives a huge performance benefit: if a parent wrapper re-renders due to its own scroll or hover state, the `children` element reference passed from above stays identical, letting React skip re-rendering that subtree.',
        ],
        takeaways: [
          'Use `children: ReactNode` for single-hole containers and explicit `ReactNode` slot props for multi-region layouts.',
          'Composition solves most prop drilling without reaching for Context or a state library.',
          'Keeping state local to a wrapper while passing `children` from above isolates re-renders naturally.',
        ],
      },
      codeDeck: {
        filename: 'HudPanel.tsx',
        language: 'tsx',
        code: `import type { ReactNode } from 'react';

interface HudPanelProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function HudPanel({ title, actions, children }: HudPanelProps) {
  return (
    <section className="hud-card">
      <header className="hud-panel-head">
        <h3>{title}</h3>
        {actions ? <div className="hud-panel-actions">{actions}</div> : null}
      </header>
      <div className="hud-panel-body">{children}</div>
    </section>
  );
}`,
        pitfall: 'Adding 12 configuration props (`showHeaderButton`, `buttonLabel`, `onButtonClick`, `buttonDisabled`) turns reusable shells into rigid monoliths.',
        proTip: 'Pass `<HudPanel actions={<button>EXPORT</button>}>...</HudPanel>`—now the caller controls the button completely.',
      },
      miniChallenge: {
        prompt: 'Wrap a heavy `<ExpensiveGraph />` inside a `<ScrollTracker>` component that stores `scrollY` in state without causing `<ExpensiveGraph />` to re-render on scroll.',
        hints: [
          'Accept `children: ReactNode` inside `ScrollTracker`.',
          'Render `<ScrollTracker><ExpensiveGraph /></ScrollTracker>` in the parent.',
        ],
        solutionCode: `import { useState, type ReactNode } from 'react';

export function ScrollTracker({ children }: { children: ReactNode }) {
  const [scrollY, setScrollY] = useState(0);
  return (
    <div onScroll={(e) => setScrollY(e.currentTarget.scrollTop)}>
      <div className="hud-readout">Y: {scrollY}px</div>
      {children}
    </div>
  );
}`,
      },
      quickCheck: [
        {
          id: 'qc-02-2-a',
          question: 'When `ScrollTracker` updates its `scrollY` state, why does its `children` prop avoid re-rendering?',
          options: [
            'React memoizes every component that receives `children`.',
            '`children` was created by the parent before `ScrollTracker` rendered, so its element object reference has not changed.',
          ],
          correctIndex: 1,
          explanation: 'Because the parent did not re-render, `props.children` is the exact same object reference, so React bails out of that subtree.',
        },
      ],
      docs: [
        { label: 'React.dev — Passing JSX as Children', url: 'https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children' },
      ],
    },
    {
      id: 'pure-components-immutability',
      index: '02.3',
      title: 'Pure Components & Immutability',
      summary: 'Keep render functions pure and update arrays/objects immutably so React detects changes reliably.',
      estimatedMinutes: 15,
      difficulty: 'Core',
      tags: ['Purity', 'Immutability', 'StrictMode'],
      mentalModel: {
        paragraphs: [
          'Given the same inputs (props, state, context), a React component must always return the same JSX during render. It should never mutate pre-existing variables, push to prop arrays, or perform network/DOM side effects directly in the render body.',
          'React compares state and prop references with `Object.is`. If you mutate an object or array in place (`items.push(x)`), the reference stays identical, so React assumes nothing changed and skips the update.',
        ],
        takeaways: [
          'Use non-mutating operations for state updates: spread `{ ...obj }`, `.map()`, `.filter()`, `.toSorted()`, or `[...arr, item]`.',
          'Local mutation of a brand-new array created inside the same render pass is safe; mutating props or state is forbidden.',
          'Side effects belong in event handlers or `useEffect`, never during render.',
        ],
      },
      codeDeck: {
        filename: 'ImmutableUpdates.ts',
        language: 'tsx',
        code: `export interface TopicNode {
  id: string;
  done: boolean;
}

// Toggle a single item without mutating the original array or object
export function toggleTopicDone(nodes: readonly TopicNode[], targetId: string): TopicNode[] {
  return nodes.map((node) =>
    node.id === targetId ? { ...node, done: !node.done } : node
  );
}

// Sort safely using ES2023 toSorted() (or [...nodes].sort())
export function sortById(nodes: readonly TopicNode[]): TopicNode[] {
  return nodes.toSorted((a, b) => a.id.localeCompare(b.id));
}`,
        pitfall: 'Calling `items.sort()` directly on a state array mutates it in place and causes subtle stale-UI bugs.',
        proTip: 'Type props and state collections as `readonly T[]` in TypeScript to get compile-time errors if anyone calls `.push()` or `.sort()`.',
      },
      miniChallenge: {
        prompt: 'Write a pure helper `removeTag(tags: readonly string[], tagToRemove: string)` and an immutable `renameUser(user, name)` updater.',
        hints: [
          'Use `.filter()` for removal.',
          'Use object spread `{ ...user, name }` for updates.',
        ],
        solutionCode: `export function removeTag(tags: readonly string[], tagToRemove: string): string[] {
  return tags.filter((tag) => tag !== tagToRemove);
}

export function renameUser<T extends { name: string }>(user: T, name: string): T {
  return { ...user, name };
}`,
      },
      quickCheck: [
        {
          id: 'qc-02-3-a',
          question: 'Why does React `<StrictMode>` invoke your component body twice in development?',
          options: [
            'To double performance by warming up the JIT.',
            'To surface impure renders that mutate shared variables or props.',
          ],
          correctIndex: 1,
          explanation: 'Double-rendering in dev exposes accidental mutations and non-idempotent render logic immediately.',
        },
      ],
      docs: [
        { label: 'React.dev — Keeping Components Pure', url: 'https://react.dev/learn/keeping-components-pure' },
        { label: 'React.dev — Updating Arrays in State', url: 'https://react.dev/learn/updating-arrays-in-state' },
      ],
    },
    {
      id: 'events-controlled-forms',
      index: '02.4',
      title: 'Events & Controlled Forms',
      summary: 'Handle synthetic events, prevent bubbling when nesting clickables, and choose controlled vs uncontrolled inputs.',
      estimatedMinutes: 16,
      difficulty: 'Core',
      tags: ['Events', 'Forms', 'Controlled Inputs'],
      mentalModel: {
        paragraphs: [
          'React attaches delegated event listeners at the root and wraps native events in a cross-browser `SyntheticEvent`. Every event bubbles up the React component tree unless you explicitly call `e.stopPropagation()`.',
          'For forms, controlled inputs bind `value={text}` + `onChange={(e) => setText(e.target.value)}` when you need instant filtering, character counts, or cross-field validation. Uncontrolled inputs (`defaultValue` + `FormData` on `onSubmit`) are simpler for one-shot submit forms.',
        ],
        takeaways: [
          'Pass a function reference `onClick={handleClick}`, never an immediate call `onClick={handleClick()}`.',
          'Use `e.stopPropagation()` on nested action buttons inside clickable cards so clicking the button does not also open the card.',
          'Never mix `value` and `defaultValue` on the same `<input>`.',
        ],
      },
      codeDeck: {
        filename: 'FilterInput.tsx',
        language: 'tsx',
        code: `import type { FormEvent } from 'react';

interface SearchBarProps {
  query: string;
  onQueryChange: (next: string) => void;
  onSubmitSearch: (query: string) => void;
}

export function SearchBar({ query, onQueryChange, onSubmitSearch }: SearchBarProps) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmitSearch(query.trim());
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Filter nodes..."
      />
      <button type="submit">SCAN</button>
    </form>
  );
}`,
        pitfall: 'Switching an input `value` from `undefined` to a string triggers React’s uncontrolled-to-controlled warning.',
        proTip: 'Always initialize controlled string state with `useState("")` rather than `useState<string>()`.',
      },
      miniChallenge: {
        prompt: 'Build a clickable card `<div onClick={onOpen}>` containing a nested `<button>` that toggles status without triggering `onOpen`.',
        hints: [
          'Accept `React.MouseEvent<HTMLButtonElement>` in the button handler.',
          'Call `e.stopPropagation()` before toggling.',
        ],
        solutionCode: `import type { MouseEvent } from 'react';

export function NodeCard({ onOpen, onToggle }: { onOpen: () => void; onToggle: () => void }) {
  function handleToggle(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    onToggle();
  }

  return (
    <div role="button" tabIndex={0} onClick={onOpen}>
      <span>Topic Node</span>
      <button type="button" onClick={handleToggle}>
        TOGGLE
      </button>
    </div>
  );
}`,
      },
      quickCheck: [
        {
          id: 'qc-02-4-a',
          question: 'When should you prefer a controlled `<input>` over an uncontrolled one?',
          options: [
            'When you need live UI updates on every keystroke (instant search, validation, disabled submit state).',
            'Never; React forbids controlled inputs in v19.',
          ],
          correctIndex: 0,
          explanation: 'Controlled inputs keep React state as the single source of truth on every keystroke.',
        },
      ],
      docs: [
        { label: 'React.dev — Responding to Events', url: 'https://react.dev/learn/responding-to-events' },
        { label: 'React.dev — Sharing State / Inputs', url: 'https://react.dev/reference/react-dom/components/input' },
      ],
    },
    {
      id: 'compound-components-apis',
      index: '02.5',
      title: 'Compound Components & Reusable APIs',
      summary: 'Design ergonomic multi-part component families (`Tabs.List`, `Tabs.Panel`) powered by shared context.',
      estimatedMinutes: 18,
      difficulty: 'Intermediate',
      tags: ['Compound Components', 'Design Systems', 'API Design'],
      mentalModel: {
        paragraphs: [
          'When a UI widget has coordinated sub-parts (Tabs, Accordion, Select, Dialog), flat prop APIs quickly explode. Compound components expose a root container that shares state implicitly via Context with child sub-components (`Accordion.Item`, `Accordion.Trigger`, `Accordion.Content`).',
          'This gives consumers full control over markup order, wrappers, and styling while preserving accessible keyboard/ARIA coordination behind the scenes.',
        ],
        takeaways: [
          'Attach subcomponents as properties (`Tabs.Trigger = TabsTrigger`) or export named pieces together.',
          'Throw a clear error inside a `useTabsContext()` helper if a subcomponent is used outside its root.',
          'Support both controlled (`value` + `onValueChange`) and uncontrolled (`defaultValue`) modes when building library primitives.',
        ],
      },
      codeDeck: {
        filename: 'HudTabs.tsx',
        language: 'tsx',
        code: `import { createContext, useContext, useState, type ReactNode } from 'react';

interface TabsCtx {
  active: string;
  setActive: (id: string) => void;
}

const TabsContext = createContext<TabsCtx | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('HudTabs subcomponents must render inside <HudTabs.Root>');
  return ctx;
}

function Root({ defaultId, children }: { defaultId: string; children: ReactNode }) {
  const [active, setActive] = useState(defaultId);
  return <TabsContext value={{ active, setActive }}>{children}</TabsContext>;
}

function Trigger({ id, children }: { id: string; children: ReactNode }) {
  const { active, setActive } = useTabs();
  return (
    <button type="button" aria-selected={active === id} onClick={() => setActive(id)}>
      {children}
    </button>
  );
}

export const HudTabs = { Root, Trigger };`,
        pitfall: 'Providing a silent dummy default value to `createContext` hides missing-provider bugs until production.',
        proTip: 'In React 19, you can render `<TabsContext value={...}>` directly without `.Provider`!',
      },
      miniChallenge: {
        prompt: 'Add a `Panel` subcomponent to `HudTabs` that renders `children` only when `active === id`.',
        hints: [
          'Call `useTabs()` inside `Panel`.',
          'Return `null` if `active !== id`.',
        ],
        solutionCode: `function Panel({ id, children }: { id: string; children: ReactNode }) {
  const { active } = useTabs();
  if (active !== id) return null;
  return <div role="tabpanel">{children}</div>;
}`,
      },
      quickCheck: [
        {
          id: 'qc-02-5-a',
          question: 'What is the main advantage of the Compound Components pattern?',
          options: [
            'Consumers can arrange sub-elements flexibly in JSX without passing dozens of configuration props.',
            'It eliminates all React re-renders automatically.',
          ],
          correctIndex: 0,
          explanation: 'Compound components decouple layout/markup structure from coordinated internal state.',
        },
      ],
      docs: [
        { label: 'React.dev — Passing Data Deeply with Context', url: 'https://react.dev/learn/passing-data-deeply-with-context' },
      ],
    },
  ],
};
