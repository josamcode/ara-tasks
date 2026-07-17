import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'ARA Tasks',
};

/**
 * Minimal root layout so the app builds.
 *
 * The bilingual shell — per-locale `dir`, next-intl bundles, logical properties —
 * is S0-25, and the real sidebar/topbar shell is S0-26. `lang="en"` here is a
 * placeholder, NOT a decision that English is the default locale.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
