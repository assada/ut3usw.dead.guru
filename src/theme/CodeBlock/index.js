import React from 'react';
import CodeBlock from '@theme-original/CodeBlock';

export default function CodeBlockWrapper(props) {
  // Remark-shiki converts code blocks to raw HTML before MDX processes them,
  // so Shiki-highlighted code never reaches this component.
  // This wrapper only handles runtime <CodeBlock> usage (e.g., homepage).
  return <CodeBlock {...props} />;
}
