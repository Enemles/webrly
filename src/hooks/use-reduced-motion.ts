'use client'

import { useReducedMotion as useFramerReducedMotion } from 'motion/react'

/**
 * Indique si l'utilisateur a activé « réduire les animations » (OS/navigateur).
 * Wrapper autour de framer-motion pour disposer d'une source unique, utilisable
 * aussi par les branches non-framer (GSAP, canvas Silk, vidéos).
 * Retourne `false` tant que la préférence n'est pas connue (SSR / 1er rendu).
 */
export function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false
}
