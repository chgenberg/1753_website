import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['sv', 'en', 'es', 'de', 'fr'],
  
  // Used when no locale matches
  defaultLocale: 'sv',
  localePrefix: 'always'
})

export const config = {
  // Match only internationalized pathnames
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
} 