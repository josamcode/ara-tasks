/**
 * Shared Prettier configuration.
 *
 * `endOfLine: 'lf'` is not a style preference — it matches the LF normalization
 * enforced by .gitattributes, so formatting and git agree on Windows.
 *
 * @type {import('prettier').Config}
 */
const config = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  arrowParens: 'always',
  endOfLine: 'lf',
};

export default config;
