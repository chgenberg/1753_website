"use client"

import React, { useRef, useState } from 'react'

type Zone = 'forehead' | 'leftCheek' | 'rightCheek' | 'nose' | 'chin'

export interface ZoneMetrics {
  meanLuminance: number
  rednessIndex: number
  highlightRatio: number
  textureVariance: number
}

export interface ImageMetricsResult {
  zones: Record<Zone, ZoneMetrics>
  width: number
  height: number
  confidence: number
}

export default function FacePhotoAnalyzer({ onAnalyze }: { onAnalyze: (metrics: ImageMetricsResult) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setBusy(true)
    setSummary(null)
    try {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      const img = await loadImage(url)
      const maxW = 512
      const scale = Math.min(1, maxW / img.width)
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      const zones = computeZones(w, h)
      const metrics: Record<Zone, ZoneMetrics> = {
        forehead: computeZoneMetrics(ctx, zones.forehead),
        leftCheek: computeZoneMetrics(ctx, zones.leftCheek),
        rightCheek: computeZoneMetrics(ctx, zones.rightCheek),
        nose: computeZoneMetrics(ctx, zones.nose),
        chin: computeZoneMetrics(ctx, zones.chin)
      }
      // Confidence heuristics: exposure range + image size
      const overallLum = Object.values(metrics).reduce((s, z) => s + z.meanLuminance, 0) / 5
      const exposurePenalty = overallLum < 40 || overallLum > 220 ? 0.4 : 0
      const sizePenalty = w < 300 || h < 400 ? 0.2 : 0
      const confidence = Math.max(0.4, 1 - exposurePenalty - sizePenalty)
      const result: ImageMetricsResult = { zones: metrics, width: w, height: h, confidence }
      onAnalyze(result)
      setSummary(`Analys klar • Ljusnivå ${(overallLum|0)} • Konfidens ${(confidence*100).toFixed(0)}%`)
    } catch (e) {
      console.error('Face analysis failed', e)
      setSummary('Kunde inte analysera bilden. Försök igen i bättre ljus.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <div className="font-medium text-gray-900">Valfri fotobaserad analys</div>
        <button
          type="button"
          className="px-3 py-1 text-sm rounded-full border border-gray-300 hover:bg-gray-50"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >{busy ? 'Analyserar…' : 'Ladda upp selfie'}</button>
      </div>
      <p className="text-sm text-gray-600 mb-3">Stå i dagsljus, neutral bakgrund. Justera ansiktet i ramen och ladda upp ett foto (frivilligt). Vi beräknar enkla zon‑mått lokalt på din enhet.</p>
      {previewUrl && (
        <div className="relative aspect-[4/5] w-full max-w-xs overflow-hidden rounded-lg border">
          <img src={previewUrl} alt="Förhandsvisning" className="w-full h-full object-cover" />
          {/* Simple overlay guidance */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[12%] left-[20%] right-[20%] h-[12%] border-2 border-amber-400/70 rounded"></div>
            <div className="absolute top-[30%] left-[10%] w-[25%] h-[20%] border-2 border-amber-400/70 rounded"></div>
            <div className="absolute top-[30%] right-[10%] w-[25%] h-[20%] border-2 border-amber-400/70 rounded"></div>
            <div className="absolute top-[30%] left-[42.5%] w-[15%] h-[35%] border-2 border-amber-400/70 rounded"></div>
            <div className="absolute bottom-[8%] left-[30%] right-[30%] h-[15%] border-2 border-amber-400/70 rounded"></div>
          </div>
        </div>
      )}
      {summary && <div className="text-sm text-gray-700 mt-3">{summary}</div>}
      <input ref={inputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => {
        const f = e.target.files?.[1] || e.target.files?.[0]
        if (f) handleFile(f)
      }} />
    </div>
  )
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

function computeZones(w: number, h: number) {
  // Rects as {x,y,w,h} in pixels, relative to centered face assumption
  return {
    forehead: rectPct(w, h, 0.2, 0.12, 0.6, 0.12),
    leftCheek: rectPct(w, h, 0.1, 0.30, 0.25, 0.20),
    rightCheek: rectPct(w, h, 0.65, 0.30, 0.25, 0.20),
    nose: rectPct(w, h, 0.425, 0.30, 0.15, 0.35),
    chin: rectPct(w, h, 0.30, 0.77, 0.40, 0.15)
  }
}

function rectPct(w: number, h: number, x: number, y: number, rw: number, rh: number) {
  return { x: Math.round(w * x), y: Math.round(h * y), w: Math.round(w * rw), h: Math.round(h * rh) }
}

function computeZoneMetrics(ctx: CanvasRenderingContext2D, r: { x: number; y: number; w: number; h: number }): ZoneMetrics {
  const { data, width } = ctx.getImageData(r.x, r.y, r.w, r.h)
  let sumY = 0, sumRG = 0, sumY2 = 0, highlights = 0, n = 0
  for (let i = 0; i < data.length; i += 4) {
    const R = data[i], G = data[i + 1], B = data[i + 2]
    const Y = 0.2126 * R + 0.7152 * G + 0.0722 * B
    sumY += Y
    sumY2 += Y * Y
    sumRG += Math.max(0, R - G) // crude redness proxy
    if (Y > 230) highlights++
    n++
  }
  const meanY = n ? sumY / n : 0
  const varY = n ? Math.max(0, sumY2 / n - meanY * meanY) : 0
  const redness = n ? sumRG / n : 0
  return {
    meanLuminance: round(meanY, 1),
    rednessIndex: round((redness / 255) * 100, 1),
    highlightRatio: round((highlights / n) * 100, 2),
    textureVariance: round(varY, 1)
  }
}

function round(v: number, p = 2) {
  const f = Math.pow(10, p)
  return Math.round(v * f) / f
} 