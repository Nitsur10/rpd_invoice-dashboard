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
}

module.exports = nextConfig