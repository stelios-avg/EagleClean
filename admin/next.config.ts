import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Avoid picking the Expo monorepo root as Turbopack/webpack root.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
