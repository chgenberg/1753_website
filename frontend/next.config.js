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
    unoptimized: false,
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
        ],
      },
    ]
  },
}

module.exports = withNextIntl(nextConfig, {
  trailingSlash: false
}); 