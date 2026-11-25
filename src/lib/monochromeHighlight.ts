export type TokenKind =
  | 'plain'
  | 'kw'
  | 'hook'
  | 'fn'
  | 'type'
  | 'tag'
  | 'attr'
  | 'str'
  | 'num'
  | 'com'
  | 'punct';

export interface HighlightToken {
  kind: TokenKind;
  text: string;
}

const KEYWORDS = new Set([
  'import',
  'from',
  'export',
  'default',
  'function',
  'const',
  'let',
  'var',
  'return',
  'if',
  'else',
  'switch',
  'case',
  'break',
  'for',
  'of',
  'in',
  'while',
  'try',
  'catch',
  'finally',
  'throw',
  'new',
  'async',
  'await',
  'void',
  'typeof',
  'keyof',
  'extends',
  'implements',
  'interface',
  'type',
  'class',
  'static',
  'as',
  'readonly',
]);

const LITERAL_VALUES = new Set(['true', 'false', 'null', 'undefined']);

const HOOKS = new Set([
  'use',
  'useState',
  'useEffect',
  'useLayoutEffect',
  'useMemo',
  'useCallback',
  'useRef',
  'useReducer',
  'useContext',
  'useId',
  'useTransition',
  'useDeferredValue',
  'useActionState',
  'useOptimistic',
  'useFormStatus',
  'useSyncExternalStore',
]);

const TYPES = new Set([
  'string',
  'number',
  'boolean',
  'unknown',
  'never',
  'ReactNode',
  'FormEvent',
  'MouseEvent',
  'KeyboardEvent',
  'ComponentPropsWithoutRef',
  'Dispatch',
  'Promise',
  'Set',
  'Map',
  'Record',
  'Error',
  'ErrorInfo',
  'FormData',
  'AbortController',
  'HTMLInputElement',
  'HTMLFormElement',
  'HTMLButtonElement',
  'HTMLCanvasElement',
  'HTMLElement',
]);

const TOKEN_REGEX =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|`(?:\\[\s\S]|[^`\\])*`|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|<\/?[a-z][a-zA-Z0-9-]*\b|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$-]*\b(?=\s*=)|\b[A-Za-z_$][\w$]*\b(?=\s*\()|\b[A-Za-z_$][\w$]*\b|[{}()[\].,:;?+\-*/=<>!&|^~]+)/g;

export function tokenizeMonochromeTsx(code: string): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  let lastIndex = 0;

  for (const match of code.matchAll(TOKEN_REGEX)) {
    const idx = match.index ?? 0;
    if (idx > lastIndex) {
      tokens.push({ kind: 'plain', text: code.slice(lastIndex, idx) });
    }

    const text = match[0];
    let kind: TokenKind = 'plain';

    if (text.startsWith('//') || text.startsWith('/*')) {
      kind = 'com';
    } else if (text.startsWith("'") || text.startsWith('"') || text.startsWith('`')) {
      kind = 'str';
    } else if (text.startsWith('<') && /^<\/?[a-z]/.test(text)) {
      kind = 'tag';
    } else if (/^\d/.test(text) || LITERAL_VALUES.has(text)) {
      kind = 'num';
    } else if (HOOKS.has(text) || (/^use[A-Z]/.test(text))) {
      kind = 'hook';
    } else if (KEYWORDS.has(text)) {
      kind = 'kw';
    } else if (TYPES.has(text) || /^[A-Z][A-Za-z0-9]*$/.test(text)) {
      kind = 'type';
    } else if (/^[A-Za-z_$][\w$-]*$/.test(text)) {
      // Distinguish JSX prop attributes (`className=`) vs function calls (`map(`)
      const after = code.slice(idx + text.length);
      if (/^\s*=[^=]/.test(after)) {
        kind = 'attr';
      } else if (/^\s*\(/.test(after)) {
        kind = 'fn';
      }
    } else if (!/^[A-Za-z_$]/.test(text)) {
      kind = 'punct';
    }

    tokens.push({ kind, text });
    lastIndex = idx + text.length;
  }

  if (lastIndex < code.length) {
    tokens.push({ kind: 'plain', text: code.slice(lastIndex) });
  }

  return tokens;
}

export function tokenizeTsxLines(code: string): HighlightToken[][] {
  const flatTokens = tokenizeMonochromeTsx(code);
  const lines: HighlightToken[][] = [[]];

  for (const tok of flatTokens) {
    if (!tok.text.includes('\n')) {
      lines[lines.length - 1].push(tok);
      continue;
    }

    const parts = tok.text.split('\n');
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].length > 0) {
        lines[lines.length - 1].push({ kind: tok.kind, text: parts[i] });
      }
      if (i < parts.length - 1) {
        lines.push([]);
      }
    }
  }

  return lines;
}
