const withNextIntl = require('next-intl/plugin')('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_JUDGE_ME_SHOP_DOMAIN: process.env.NEXT_PUBLIC_JUDGE_ME_SHOP_DOMAIN || '1753skincare.myshopify.com',
    NEXT_PUBLIC_JUDGE_ME_PUBLIC_TOKEN: process.env.NEXT_PUBLIC_JUDGE_ME_PUBLIC_TOKEN || 'BEnXoguHo7hItl0TiV92JC65Rmk',
    JUDGE_ME_PRIVATE_TOKEN: process.env.JUDGE_ME_PRIVATE_TOKEN || '3WoipsmPeFi0aRvUOyqwsw5P21c',
    _next_intl_trailing_slash: 'false',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    unoptimized: false, // Re-enable optimization now that filenames are safe
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=15552000; includeSubDomains; preload',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.judge.me; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://1753skincare.com https://1753websitebackend-production.up.railway.app; font-src 'self' https: data:; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
          },
        ],
      },
    ]
  },
}

module.exports = withNextIntl(nextConfig, {
  trailingSlash: false
}); 