'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

interface JudgeMeWidgetProps {
  shopDomain: string
  productHandle?: string
  widgetType: 'reviews' | 'preview-badge' | 'reviews-carousel' | 'all-reviews-counter'
  className?: string
}

export const JudgeMeWidget: React.FC<JudgeMeWidgetProps> = ({
  shopDomain,
  productHandle,
  widgetType,
  className = ''
}) => {
  const [allowed, setAllowed] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('cookieConsent')
      const prefs = raw ? JSON.parse(raw) : null
      return !!prefs?.marketing
    } catch {
      return false
    }
  })
  const t = useTranslations('reviews.judgeme')

  useEffect(() => {
    const onConsent = (e: Event) => {
      const detail = (e as CustomEvent).detail as { marketing?: boolean }
      if (typeof detail?.marketing === 'boolean') setAllowed(!!detail.marketing)
    }
    window.addEventListener('consent-changed', onConsent as EventListener)
    return () => window.removeEventListener('consent-changed', onConsent as EventListener)
  }, [])

  useEffect(() => {
    if (!allowed) return
    if (!window.jdgm) {
      const script = document.createElement('script')
      script.src = 'https://cdn.judge.me/js/widget.js'
      script.async = true
      script.onload = () => {
        if (window.jdgm) {
          window.jdgm.init()
        }
      }
      document.head.appendChild(script)
    } else {
      window.jdgm.init()
    }
  }, [allowed])

  const getWidgetAttributes = () => {
    const baseAttrs: { [key: string]: string } = {
      'data-shop-domain': shopDomain,
      'data-theme': 'modern'
    }

    if (productHandle) {
      baseAttrs['data-product-handle'] = productHandle
    }

    return baseAttrs
  }

  const renderWidget = () => {
    const attrs = getWidgetAttributes()

    if (!allowed) {
      return (
        <div className={className}>
          <div className="text-sm text-gray-500">{t('marketingRequired')}</div>
        </div>
      )
    }

    switch (widgetType) {
      case 'reviews':
        return (
          <div 
            className={`jdgm-widget jdgm-review-widget ${className}`}
            {...attrs}
          />
        )
      
      case 'preview-badge':
        return (
          <div 
            className={`jdgm-widget jdgm-preview-badge ${className}`}
            {...attrs}
          />
        )
      
      case 'reviews-carousel':
        return (
          <div 
            className={`jdgm-widget jdgm-carousel-widget ${className}`}
            {...attrs}
          />
        )
      
      case 'all-reviews-counter':
        return (
          <div 
            className={`jdgm-widget jdgm-all-reviews-text ${className}`}
            {...attrs}
          />
        )
      
      default:
        return null
    }
  }

  return renderWidget()
}

// Extend window type for Judge.me
declare global {
  interface Window {
    jdgm: any
  }
} 