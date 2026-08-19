/*
 * video.js v10 skin theming custom properties, so they can be set via React's
 * inline `style` prop. @types/react's CSSProperties is closed-typed (no `--*`
 * index signature); this is the csstype-documented augmentation for custom
 * properties: https://github.com/frenic/csstype#what-should-i-do-when-i-get-type-errors
 *
 * This lives in its own file (not declarations.d.ts) because module
 * augmentation only merges when the containing file is itself a module — in a
 * global script file, `declare module 'csstype'` is an *ambient module
 * declaration* that silently replaces the real csstype for the whole program
 * (skipLibCheck hides most of the fallout). The import below is what makes
 * this file a module; declarations.d.ts must stay a script file so its
 * `interface Window` etc. remain global. (CJP)
 */
import type {} from 'csstype';

declare module 'csstype' {
  interface Properties {
    '--media-accent-color'?: string;
    '--media-accent-text-color'?: string;
  }
}
