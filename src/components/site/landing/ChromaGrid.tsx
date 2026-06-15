'use client'

import { useEffect, useRef } from 'react'
import type { CSSProperties, MouseEvent, PointerEvent, ReactNode } from 'react'

import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'

/** Filtre du voile gris (désaturation + légère atténuation). */
const VEIL = 'grayscale(1) brightness(0.82)'

interface ChromaGridProps {
  children: ReactNode
  className?: string
  /** Rayon (px) du halo de couleur qui suit le curseur */
  radius?: number
  /** Durée (s) du fondu vers le gris quand le curseur quitte la grille */
  fadeOut?: number
  /** Lissage du suivi du curseur (0-1, plus petit = plus doux) */
  smoothing?: number
}

/**
 * Conteneur « chroma » (inspiré de React Bits ChromaGrid, adapté à la landing).
 * La grille passe en niveaux de gris atténués et un halo de couleur révèle les
 * cartes autour du curseur. Le suivi est fait en requestAnimationFrame maison —
 * pas de dépendance GSAP — et l'effet est entièrement désactivé en
 * `prefers-reduced-motion` (rendu direct des enfants, sans voile ni listeners).
 */
export function ChromaGrid({
  children,
  className,
  radius = 340,
  fadeOut = 0.6,
  smoothing = 0.15,
}: ChromaGridProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const fadeRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  const raf = useRef<number | null>(null)
  const reduce = useReducedMotion()

  const setVars = (x: number, y: number) => {
    const el = rootRef.current
    if (!el) return
    el.style.setProperty('--x', `${x}px`)
    el.style.setProperty('--y', `${y}px`)
  }

  // Centre le halo au montage pour éviter un saut au premier mouvement.
  useEffect(() => {
    if (reduce) return
    const el = rootRef.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    pos.current = { x: width / 2, y: height / 2 }
    target.current = { ...pos.current }
    setVars(pos.current.x, pos.current.y)
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current)
    }
  }, [reduce])

  // Posé en inline : le minifieur CSS (lightningcss) supprime le `backdrop-filter`
  // non préfixé s'il est écrit dans globals.css.
  const veil = { backdropFilter: VEIL, WebkitBackdropFilter: VEIL } as CSSProperties

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  const tick = () => {
    const dx = target.current.x - pos.current.x
    const dy = target.current.y - pos.current.y
    pos.current.x += dx * smoothing
    pos.current.y += dy * smoothing
    setVars(pos.current.x, pos.current.y)
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      raf.current = requestAnimationFrame(tick)
    } else {
      raf.current = null
    }
  }

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = rootRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    target.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    if (raf.current == null) raf.current = requestAnimationFrame(tick)
    if (fadeRef.current) {
      fadeRef.current.style.transitionDuration = '0.25s'
      fadeRef.current.style.opacity = '0'
    }
  }

  const handleLeave = () => {
    if (fadeRef.current) {
      fadeRef.current.style.transitionDuration = `${fadeOut}s`
      fadeRef.current.style.opacity = '1'
    }
  }

  return (
    <div
      ref={rootRef}
      className={cn('chroma-grid', className)}
      style={{ '--chroma-r': `${radius}px` } as CSSProperties}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
      <div className="chroma-overlay" style={veil} aria-hidden />
      <div ref={fadeRef} className="chroma-fade" style={veil} aria-hidden />
    </div>
  )
}

interface ChromaCardProps {
  children: ReactNode
  className?: string
  /** Couleur d'accent : bordure au survol + teinte du halo de la carte */
  accent?: string
}

/**
 * Carte au sein d'une `ChromaGrid` : ajoute le halo (spotlight) suivant le
 * curseur et l'accent de bordure au survol. Le fond et la bordure de base
 * restent gérés par les classes Tailwind passées via `className`.
 */
export function ChromaCard({ children, className, accent = '#00df7a' }: ChromaCardProps) {
  const reduce = useReducedMotion()

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
  }

  return (
    <div
      className={cn('chroma-card', !reduce && 'chroma-card--spotlight', className)}
      style={
        {
          '--card-border': accent,
          '--spotlight-color': `${accent}40`,
        } as CSSProperties
      }
      onMouseMove={reduce ? undefined : handleMove}
    >
      {children}
    </div>
  )
}
