// Initialisation centralisée de GSAP + ScrollTrigger pour la refonte landing.
// On enregistre le plugin une seule fois ici ; les composants importent gsap
// et ScrollTrigger depuis ce module (idéalement via `await import('@/lib/gsap')`
// dans un useEffect pour garder GSAP hors du bundle initial).
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export { gsap, ScrollTrigger }
