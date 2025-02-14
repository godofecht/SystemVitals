/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Required for GitHub Pages
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
}

module.exports = nextConfig 