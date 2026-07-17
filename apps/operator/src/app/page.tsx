import { workspaceScaffoldSchema } from '@ara/types';
import { WorkspaceScaffold } from '@ara/ui';

/**
 * Scaffold page (S0-01) — DELETE when S7-07 lands the real operator screens.
 */
export default function Page() {
  const scaffold = workspaceScaffoldSchema.parse({ package: '@ara/types' });

  return (
    <main>
      <h1>ARA Tasks — Operator</h1>
      <p>Workspace scaffold. Contract resolved from {scaffold.package}.</p>
      <WorkspaceScaffold />
    </main>
  );
}
