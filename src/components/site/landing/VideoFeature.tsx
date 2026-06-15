'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'

import { useReducedMotion } from '@/hooks/use-reduced-motion'
import type { LandingFeatureMedia } from '@/config/features'

interface VideoFeatureProps extends LandingFeatureMedia {
  alt?: string
  className?: string
}

/**
 * Média d'un bloc feature : vidéo en boucle (autoplay/muted) quand elle existe,
 * sinon le poster seul. Respecte prefers-reduced-motion (poster only) et met la
 * vidéo en pause hors-écran (perf / batterie / data).
 */
export function VideoFeature({
  mp4,
  webm,
  poster,
  width,
  height,
  alt = '',
  className,
}: VideoFeatureProps) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLVideoElement>(null)
  const hasVideo = Boolean(mp4 || webm)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.25 },
    )
    io.observe(video)
    return () => io.disconnect()
  }, [])

  if (!hasVideo || reduce) {
    return (
      <Image
        src={poster}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    )
  }

  return (
    <video
      ref={ref}
      poster={poster}
      width={width}
      height={height}
      muted
      loop
      playsInline
      preload="none"
      className={className}
    >
      {webm ? <source src={webm} type="video/webm" /> : null}
      {mp4 ? <source src={mp4} type="video/mp4" /> : null}
    </video>
  )
}
