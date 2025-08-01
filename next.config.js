/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'reunion-photos.r2.dev',
      process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace('https://', '') || ''
    ].filter(Boolean),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig