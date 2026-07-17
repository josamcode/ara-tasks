import { z } from 'zod';

/**
 * Scaffold placeholder (S0-01) — DELETE when the first real schema lands.
 *
 * This package is the single definition site for every Zod schema in the
 * product; web and api both import from here so the contract cannot drift.
 * Real schemas arrive with the tickets that own them — tenancy (S0-10),
 * auth (S0-12), RBAC (S0-19) — not here.
 *
 * It exists today only so the package compiles and so the workspace build
 * graph is genuinely exercised rather than merely declared.
 */
export const workspaceScaffoldSchema = z.object({
  package: z.literal('@ara/types'),
});

export type WorkspaceScaffold = z.infer<typeof workspaceScaffoldSchema>;
