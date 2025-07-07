'use client'

import { useEffect } from 'react'

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
  useEffect(() => {
    // Load Judge.me script if not already loaded
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
      // If script is already loaded, just initialize
      window.jdgm.init()
    }
  }, [])

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