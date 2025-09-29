/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  
  // Environment-aware configuration for both local dev and GitHub Pages

  assetPrefix: process.env.NODE_ENV === 'production' ? '/gmml-inventory' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/gmml-inventory' : ''
}

module.exports = nextConfig
