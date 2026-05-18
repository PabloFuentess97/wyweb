import { createHighlighter, type Highlighter } from 'shiki';

let highlighterPromise: Promise<Highlighter> | null = null;

export const SHIKI_LANGS = [
  'bash',
  'shell',
  'json',
  'yaml',
  'typescript',
  'tsx',
  'javascript',
  'jsx',
  'python',
  'sql',
  'html',
  'css',
  'markdown',
  'toml',
] as const;

export function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-light-default', 'github-dark-default'],
      langs: [...SHIKI_LANGS],
    });
  }
  return highlighterPromise;
}

export async function highlightCode(code: string, lang: string): Promise<string> {
  const supported: readonly string[] = SHIKI_LANGS;
  const language = supported.includes(lang) ? lang : 'text';
  const hl = await getHighlighter();
  return hl.codeToHtml(code, {
    lang: language,
    themes: {
      light: 'github-light-default',
      dark: 'github-dark-default',
    },
    defaultColor: false,
  });
}
