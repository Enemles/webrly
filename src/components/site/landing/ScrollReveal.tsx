'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'

import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface ScrollRevealProps {
  children: ReactNode
  /** Décalage vertical initial en px (avant apparition) */
  y?: number
  /** Délai avant l'animation (s) */
  delay?: number
  /** Durée de l'animation (s) */
  duration?: number
  /** Ne jouer qu'une seule fois */
  once?: boolean
  className?: string
}

/**
 * Wrapper de reveal au scroll, unique pour toute la landing.
 * Fade + translation verticale à l'entrée dans le viewport.
 * Respecte `prefers-reduced-motion` : rend directement l'état final, sans anim.
 */
export function ScrollReveal({
  children,
  y = 24,
  delay = 0,
  duration = 0.6,
  once = true,
  className,
}: ScrollRevealProps) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '0px 0px -10% 0px' }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
