/**
 * Reads code examples from src/data/code-examples.js and generates
 * pre-highlighted HTML via Shiki into src/generated/code-examples.json.
 *
 * Usage: node plugins/generate-code-examples.mjs
 * Runs automatically via `prebuild` npm script.
 *
 * To add/edit examples, modify src/data/code-examples.js — this script
 * reads whatever is there.
 */
import { createHighlighter } from 'shiki';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'src', 'generated');

async function generate() {
  const { default: examples } = await import(join(root, 'src', 'data', 'code-examples.js'));
  const langs = [...new Set(examples.map(e => e.language))];

  const highlighter = await createHighlighter({
    themes: ['github-light', 'one-dark-pro'],
    langs,
  });

  const result = examples.map(({ language, code }) => ({
    language,
    html: highlighter.codeToHtml(code, {
      lang: language,
      themes: { light: 'github-light', dark: 'one-dark-pro' },
      defaultColor: false,
    }),
  }));

  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'code-examples.json'), JSON.stringify(result));
  console.log(`Generated ${result.length} code examples`);
}

generate();
