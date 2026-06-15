// Données des "blocs features" alternés de la landing (façon screen.studio).
// `media.mp4` vide = on affiche le poster en attendant les vraies vidéos démo.
// TODO(content): remplacer les posters par les vraies captures vidéo dans
// public/assets/landing/ (cf. spec : 1280x800, mp4 + webm, boucle muette ~8-12s).

export interface LandingFeatureMedia {
  mp4?: string
  webm?: string
  poster: string
  width: number
  height: number
}

export interface LandingFeature {
  id: string
  eyebrow: string
  title: string
  body: string
  media: LandingFeatureMedia
  /** Inverse l'ordre texte/média (rythme alterné) */
  reverse?: boolean
}

export const LANDING_FEATURES: LandingFeature[] = [
  {
    id: 'website-builder',
    eyebrow: 'Website Builder',
    title: 'Ship client sites without code',
    body: "Build and publish funnels and websites for every client with a drag-and-drop editor — tailored to their brand, connected to your CRM, live on a custom subdomain.",
    media: { poster: '/assets/preview.png', width: 1280, height: 800 },
    reverse: false,
  },
  {
    id: 'pipelines',
    eyebrow: 'Pipelines',
    title: 'See every deal at a glance',
    body: 'Visual Kanban pipelines with drag-and-drop lanes. Track projects from first touch to closed-won, prioritise the work that matters, and keep the whole team aligned.',
    media: { poster: '/assets/preview.png', width: 1280, height: 800 },
    reverse: true,
  },
  {
    id: 'team-access',
    eyebrow: 'Team Access',
    title: 'Bring your whole team, safely',
    body: 'Role-based permissions per member and per sub-account. Everyone gets exactly the access they need — no more, no less — so collaboration stays fast and data stays secure.',
    media: { poster: '/assets/preview.png', width: 1280, height: 800 },
    reverse: false,
  },
  {
    id: 'leads',
    eyebrow: 'Leads',
    title: 'Turn leads into revenue',
    body: 'A real-time dashboard of every opportunity. Track leads, prioritise follow-ups, and watch conversion rates climb with insights that drive the next action.',
    media: { poster: '/assets/preview.png', width: 1280, height: 800 },
    reverse: true,
  },
]
