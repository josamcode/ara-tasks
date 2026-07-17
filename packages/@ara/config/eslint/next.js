import js from '@eslint/js';
import eslintConfigNext from 'eslint-config-next';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { ignores } from './base.js';

/**
 * ESLint config for the Next.js apps (web, operator).
 *
 * Same strict TypeScript baseline as every other workspace, plus the official
 * Next.js flat config (react, react-hooks, jsx-a11y, @next/next). Order matters:
 *   1. shared ignores (adds docs/design to Next's own .next/out/build ignores)
 *   2. the JS + TypeScript recommended baseline
 *   3. the Next.js config
 *   4. eslint-config-prettier LAST, so formatting rules always defer to Prettier
 */
export const nextConfig = tseslint.config(
  { ignores },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  ...eslintConfigNext,
  eslintConfigPrettier,
);

export default nextConfig;
