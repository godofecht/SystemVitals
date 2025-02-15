/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Update basePath to be absolute
  basePath: '/systemvitals',
  // Add assetPrefix for GitHub Pages
  assetPrefix: '/systemvitals',
}

module.exports = nextConfig 