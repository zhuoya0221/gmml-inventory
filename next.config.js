/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  eslint: {
    // Disable ESLint during builds for deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript checks during builds for deployment
    ignoreBuildErrors: true,
  },
  // Ensure proper routing for GitHub Pages
  assetPrefix: process.env.NODE_ENV === 'production' ? '/gmml-inventory' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/gmml-inventory' : ''
}

module.exports = nextConfig
