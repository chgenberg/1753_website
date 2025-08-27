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
    NEXT_PUBLIC_VIVA_SOURCE_CODE: process.env.NEXT_PUBLIC_VIVA_SOURCE_CODE,
    NEXT_PUBLIC_VIVA_SOURCE_CODE_SEK: process.env.NEXT_PUBLIC_VIVA_SOURCE_CODE_SEK,
    NEXT_PUBLIC_VIVA_SOURCE_CODE_EUR: process.env.NEXT_PUBLIC_VIVA_SOURCE_CODE_EUR,

    NEXT_PUBLIC_VIVA_BASE_URL: process.env.NEXT_PUBLIC_VIVA_BASE_URL,
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
            value: 'credentialless',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.judge.me https://api.vivapayments.com https://demo-api.vivapayments.com https://accounts.vivapayments.com https://www.vivapayments.com https://demo.vivapayments.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; media-src 'self' data: https: blob:; worker-src 'self' blob:; connect-src 'self' https://1753skincare.com https://1753websitebackend-production.up.railway.app https://api.vivapayments.com https://demo-api.vivapayments.com https://accounts.vivapayments.com https://www.vivapayments.com https://demo.vivapayments.com; font-src 'self' https: data:; object-src 'none'; frame-src https://www.vivapayments.com https://demo.vivapayments.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
          },
        ],
      },
      // API routes caching
      {
        source: '/api/products/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400', // 1 hour, stale for 1 day
          },
        ],
      },
      {
        source: '/api/blog/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600', // 30 min, stale for 1 hour
          },
        ],
      },
      {
        source: '/api/knowledge/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=7200, s-maxage=7200, stale-while-revalidate=86400', // 2 hours, stale for 1 day
          },
        ],
      },
      {
        source: '/api/reviews/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300, stale-while-revalidate=1800', // 5 min, stale for 30 min
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300', // 5 minutes default
          },
        ],
      },
      // Static assets
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 year
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400', // 1 day
          },
        ],
      },
      // Fonts
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 year
          },
        ],
      },
    ]
  },
}

module.exports = withNextIntl(nextConfig, {
  trailingSlash: false
}); 