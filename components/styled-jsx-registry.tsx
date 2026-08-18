'use client';

/*
 * styled-jsx SSR registry for the App Router, per the Next.js docs
 * (https://nextjs.org/docs/app/guides/css-in-js#styled-jsx). Without this,
 * styled-jsx only injects styles client-side at hydration: server-rendered HTML
 * carries the jsx-* class names but no rules, so every page that uses styled-jsx
 * paints unstyled first and then shifts when the styles land (measured as
 * CLS ~1.4 on the /v player routes in production). (CJP)
 */
import { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { StyleRegistry, createStyleRegistry } from 'styled-jsx';

export default function StyledJsxRegistry({ children }: { children: React.ReactNode }) {
  const [jsxStyleRegistry] = useState(() => createStyleRegistry());

  useServerInsertedHTML(() => {
    const styles = jsxStyleRegistry.styles();
    jsxStyleRegistry.flush();
    return <>{styles}</>;
  });

  return <StyleRegistry registry={jsxStyleRegistry}>{children}</StyleRegistry>;
}
