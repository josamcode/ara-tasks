import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'ARA Tasks — Operator',
};

/**
 * Minimal root layout so the app builds. The operator console is a separate
 * plane with its own auth audience (S7-01); nothing here is shared with the
 * tenant dashboard at runtime.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
