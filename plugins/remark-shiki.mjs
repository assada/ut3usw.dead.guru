import { createHighlighter } from 'shiki';
import { visit } from 'unist-util-visit';

let highlighterPromise;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-light', 'one-dark-pro'],
      langs: [],
    });
  }
  return highlighterPromise;
}

export default function remarkShiki() {
  return async (tree) => {
    const highlighter = await getHighlighter();
    const nodesToProcess = [];

    visit(tree, 'code', (node, index, parent) => {
      nodesToProcess.push({ node, index, parent });
    });

    for (const { node, index, parent } of nodesToProcess) {
      const lang = node.lang || 'text';
      const code = node.value;

      // Load language on demand
      const loadedLangs = highlighter.getLoadedLanguages();
      if (!loadedLangs.includes(lang)) {
        try {
          await highlighter.loadLanguage(lang);
        } catch {
          try {
            if (!loadedLangs.includes('text')) {
              await highlighter.loadLanguage('text');
            }
          } catch { /* ignore */ }
        }
      }

      let html;
      try {
        html = highlighter.codeToHtml(code, {
          lang,
          themes: {
            light: 'github-light',
            dark: 'one-dark-pro',
          },
          defaultColor: false,
        });
      } catch {
        continue;
      }

      // Use mdxJsxFlowElement with dangerouslySetInnerHTML
      // This is the only way to inject raw HTML in MDX
      parent.children.splice(index, 1, {
        type: 'mdxJsxFlowElement',
        name: 'div',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'dangerouslySetInnerHTML',
            value: {
              type: 'mdxJsxAttributeValueExpression',
              value: `{__html: ${JSON.stringify(html)}}`,
              data: {
                estree: {
                  type: 'Program',
                  body: [{
                    type: 'ExpressionStatement',
                    expression: {
                      type: 'ObjectExpression',
                      properties: [{
                        type: 'Property',
                        method: false,
                        shorthand: false,
                        computed: false,
                        key: { type: 'Identifier', name: '__html' },
                        value: { type: 'Literal', value: html },
                        kind: 'init',
                      }],
                    },
                  }],
                  sourceType: 'module',
                },
              },
            },
          },
        ],
        children: [],
      });
    }
  };
}
