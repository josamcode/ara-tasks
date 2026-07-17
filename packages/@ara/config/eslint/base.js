import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Paths no workspace should ever lint.
 *
 * `docs/design` holds the 16 source-of-truth design documents — including a
 * reference .jsx component library that is documentation, not a build target.
 */
export const ignores = [
  '**/dist/**',
  '**/.next/**',
  '**/.turbo/**',
  '**/node_modules/**',
  '**/coverage/**',
  'docs/design/**',
];

/**
 * The shared ESLint baseline. Every non-Next workspace extends this; none
 * redefines it. The Next.js apps use `./next.js`, which layers the Next config
 * on this same foundation.
 */
export const baseConfig = tseslint.config(
  { ignores },
  // Register every extension we lint. Flat config discovers only .js/.mjs/.cjs
  // by default; without naming .ts/.tsx here, `eslint .` would silently skip
  // every TypeScript file and report a false pass.
  { files: ['**/*.{js,mjs,cjs,ts,tsx,mts,cts}'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  // Last: turn off every rule that would fight Prettier.
  eslintConfigPrettier,
);

export default baseConfig;
