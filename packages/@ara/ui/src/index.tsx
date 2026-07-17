import type { ReactElement } from 'react';

/**
 * Scaffold placeholder (S0-01) — DELETE when S0-23 lands.
 *
 * The real library — design tokens plus Button, TextField, StatusPill, Card and
 * FormField — is S0-23; the bilingual `Wordmark` is S0-25. Nothing here is a
 * design decision, and no tokens or styling are implied.
 *
 * Its only job today is to prove the React/JSX build path compiles and that the
 * Next.js apps can resolve a workspace package through its exports map.
 */
export function WorkspaceScaffold(): ReactElement {
  return <span data-scaffold="@ara/ui" />;
}
