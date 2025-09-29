/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Disable server-side features for static export
  experimental: {
    esmExternals: false
  },
  // Ensure proper routing for GitHub Pages
  assetPrefix: process.env.NODE_ENV === 'production' ? '/gmml-inventory' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/gmml-inventory' : ''
}

module.exports = nextConfig
