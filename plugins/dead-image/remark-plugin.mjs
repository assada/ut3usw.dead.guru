/**
 * Remark plugin that transforms markdown images to <DeadImage /> components.
 *
 * ![alt](./img/photo.png) → <DeadImage img={require("dead-img!./img/photo.png")} alt="alt" />
 *
 * Works with Docusaurus MDX pipeline. Images are processed by the dead-img webpack loader.
 */
import { visit, EXIT } from 'unist-util-visit';

export default function deadImageRemarkPlugin() {
  return (ast) => {
    let needsImport = false;

    // Docusaurus converts ![alt](./path) to <img> JSX elements with require() in src.
    // We intercept those and transform them to <DeadImage>.
    visit(ast, 'mdxJsxTextElement', (node) => {
      if (node.name !== 'img') return;

      const srcAttr = node.attributes.find(
        (a) => a.type === 'mdxJsxAttribute' && a.name === 'src'
      );
      if (!srcAttr?.value || typeof srcAttr.value !== 'object') return;

      // Match require("./img/file.png").default or require("@site/...").default
      const srcValue = srcAttr.value.value;
      const match = srcValue?.match(/^require\("(.+?)"\)\.default$/);
      if (!match) return;

      const originalPath = match[1];

      // Collect alt and title
      const attrs = [];
      for (const a of node.attributes) {
        if (a.type === 'mdxJsxAttribute' && (a.name === 'alt' || a.name === 'title')) {
          attrs.push(a);
        }
      }

      // Add img prop with dead-img loader
      attrs.push({
        type: 'mdxJsxAttribute',
        name: 'img',
        value: assetRequireValue(`dead-img!${originalPath}`),
      });

      // Transform node in place
      Object.keys(node).forEach((k) => delete node[k]);
      Object.assign(node, {
        type: 'mdxJsxFlowElement',
        name: 'DeadImage',
        attributes: attrs,
        children: [],
      });

      needsImport = true;
    });

    if (needsImport) {
      // Check if import already exists
      let hasImport = false;
      visit(ast, 'mdxjsEsm', (node) => {
        if (node.data?.estree?.body?.some(
          (b) => b.type === 'ImportDeclaration' &&
            b.specifiers?.some((s) => s.local?.name === 'DeadImage')
        )) {
          hasImport = true;
          return EXIT;
        }
      });

      if (!hasImport && ast.type === 'root') {
        ast.children.unshift(createImportNode());
      }
    }
  };
}

function createImportNode() {
  return {
    type: 'mdxjsEsm',
    value: "import DeadImage from '@theme/DeadImage'",
    data: {
      estree: {
        type: 'Program',
        body: [{
          type: 'ImportDeclaration',
          specifiers: [{
            type: 'ImportDefaultSpecifier',
            local: { type: 'Identifier', name: 'DeadImage' },
          }],
          source: {
            type: 'Literal',
            value: '@theme/DeadImage',
            raw: "'@theme/DeadImage'",
          },
        }],
        sourceType: 'module',
        comments: [],
      },
    },
  };
}

function assetRequireValue(requireString) {
  return {
    type: 'mdxJsxAttributeValueExpression',
    value: `require("${requireString}")`,
    data: {
      estree: {
        type: 'Program',
        body: [{
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'require' },
            arguments: [{
              type: 'Literal',
              value: requireString,
              raw: `"${requireString}"`,
            }],
            optional: false,
          },
        }],
        sourceType: 'module',
        comments: [],
      },
    },
  };
}
