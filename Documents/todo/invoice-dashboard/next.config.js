const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@supabase/supabase-js', '@prisma/client', '@prisma/instrumentation'],
  typescript: {
    // Allow build to complete even with type errors for deployment
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow build to complete even with ESLint errors for now
    ignoreDuringBuilds: true,
  },
  // Webpack configuration optimized for Supabase-only setup
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = config.resolve || {}
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        '@/lib/orchestrator/persistence': path.resolve(__dirname, 'src/lib/orchestrator/persistence.browser.ts'),
      }

      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        path: false,
      }
    }

    // Explicitly exclude Prisma packages to prevent build errors
    config.externals = config.externals || []
    if (isServer) {
      config.externals.push({
        '@prisma/client': 'commonjs @prisma/client',
        '@prisma/instrumentation': 'commonjs @prisma/instrumentation',
        'prisma': 'commonjs prisma'
      })
    }

    return config
  }
}

module.exports = nextConfig
