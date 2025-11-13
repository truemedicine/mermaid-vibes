/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Suppress the workspace root warning
  experimental: {
    turbo: {
      root: __dirname,
    },
  },
}

module.exports = nextConfig
