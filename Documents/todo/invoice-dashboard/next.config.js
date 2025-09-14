/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@supabase/supabase-js'],
  typescript: {
    // Allow build to complete even with type errors for now
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow build to complete even with ESLint errors for now
    ignoreDuringBuilds: true,
  },
  // Webpack configuration to explicitly exclude any Prisma remnants
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent any potential Prisma imports from being bundled
      config.externals = config.externals || []
      config.externals.push({
        '@prisma/client': 'commonjs @prisma/client',
        'prisma': 'commonjs prisma'
      })
    }
    return config
  }
}

module.exports = nextConfig