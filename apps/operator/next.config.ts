import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Emit a self-contained production server for the Docker runtime image
  // (apps/operator/.next/standalone/apps/operator/server.js — see apps/operator/Dockerfile).
  output: 'standalone',
  // Trace file dependencies from the monorepo root so the standalone bundle
  // pulls in the workspace packages (@ara/ui, @ara/types). `next build` always
  // runs from this app's directory (the turbo task cwd), so ../../ is the repo root.
  outputFileTracingRoot: path.join(process.cwd(), '..', '..'),
};

export default nextConfig;
