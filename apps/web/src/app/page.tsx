import { workspaceScaffoldSchema } from '@ara/types';
import { WorkspaceScaffold } from '@ara/ui';

/**
 * Scaffold page (S0-01) — DELETE when S0-26 lands the real auth/app shell.
 *
 * It imports from both shared packages on purpose: that is what proves the
 * workspace build graph actually resolves `@ara/types` and `@ara/ui` through
 * their exports maps, rather than merely declaring the dependency edges.
 */
export default function Page() {
  const scaffold = workspaceScaffoldSchema.parse({ package: '@ara/types' });

  return (
    <main>
      <h1>ARA Tasks</h1>
      <p>Workspace scaffold. Contract resolved from {scaffold.package}.</p>
      <WorkspaceScaffold />
    </main>
  );
}
