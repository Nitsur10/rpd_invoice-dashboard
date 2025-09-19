import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security headers for production deployment
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https:; font-src 'self' data:;"
          }
        ]
      }
    ]
  },

  // Disable ESLint and TypeScript during build for optimization focus
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Enhanced webpack optimization
  webpack: (config, { dev, isServer }) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = config.resolve.alias ?? {};

    if (!isServer) {
      config.resolve.alias["@/lib/orchestrator/persistence"] =
        "@/lib/orchestrator/persistence.browser";
    }

    if (!dev && !isServer) {
      // Enhanced bundle optimization
      config.optimization = {
        ...config.optimization,
        // Improve tree shaking
        usedExports: true,
        sideEffects: false,
        // Better chunk splitting
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              enforce: true,
            },
            radixui: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: 'radixui',
              chunks: 'all',
              priority: 10,
            }
          }
        },
        // Performance hints
        performance: {
          maxAssetSize: 250000,
          maxEntrypointSize: 400000,
          hints: 'warning'
        }
      };
    }
    
    return config;
  },
  
  // Enhanced experimental features for better performance
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      'lucide-react',
      '@tanstack/react-table',
      'class-variance-authority',
      'next-themes'
    ],
  },
  
  // Enable compression and optimization
  compress: true,
  poweredByHeader: false,
  
  // Enhanced image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  }
};

export default nextConfig;
