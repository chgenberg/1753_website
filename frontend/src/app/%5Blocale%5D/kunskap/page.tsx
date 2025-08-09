'use client'

import { useEffect, useState } from 'react'

export default function KunskapPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const doFetch = async () => {
      try {
        setLoading(true)
        const locale = (typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'sv') || 'sv'
        const res = await fetch(`/api/knowledge/content?limit=12&locale=${encodeURIComponent(locale)}`)
        if (res.ok) {
          const json = await res.json()
          const list = json?.data?.content || json?.data || []
          setItems(Array.isArray(list) ? list : [])
        }
      } finally {
        setLoading(false)
      }
    }
    doFetch()
  }, [])
} 