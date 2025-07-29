import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://1753skincare.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/auth/',
          '/checkout/success/', // Don't index thank you pages
          '/quiz/results/' // Don't index personal results
        ]
      },
      {
        userAgent: 'GPTBot', // OpenAI crawler
        disallow: '/api/' // Allow content crawling but not API
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  }
} 