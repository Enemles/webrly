// Données des blocs features (onglets de la section "Everything your agency needs").
// Vidéos démo enregistrées (Screen Studio) dans public/assets/landing/, posters
// générés depuis la 1re seconde de chaque clip.

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
}

export const LANDING_FEATURES: LandingFeature[] = [
  {
    id: 'website-builder',
    eyebrow: 'Website Builder',
    title: 'Ship client sites without code',
    body: "Build and publish funnels and websites for every client with a drag-and-drop editor — tailored to their brand, connected to your CRM, live on a custom subdomain.",
    media: {
      mp4: '/assets/landing/website-builder.mp4',
      poster: '/assets/landing/website-builder-poster.jpg',
      width: 1512,
      height: 982,
    },
  },
  {
    id: 'pipelines',
    eyebrow: 'Pipelines',
    title: 'See every deal at a glance',
    body: 'Visual Kanban pipelines with drag-and-drop lanes. Track projects from first touch to closed-won, prioritise the work that matters, and keep the whole team aligned.',
    media: {
      mp4: '/assets/landing/pipelines.mp4',
      poster: '/assets/landing/pipelines-poster.jpg',
      width: 3024,
      height: 1964,
    },
  },
  {
    id: 'team-access',
    eyebrow: 'Team Access',
    title: 'Bring your whole team, safely',
    body: 'Role-based permissions per member and per sub-account. Everyone gets exactly the access they need — no more, no less — so collaboration stays fast and data stays secure.',
    media: {
      mp4: '/assets/landing/team-access.mp4',
      poster: '/assets/landing/team-access-poster.jpg',
      width: 1512,
      height: 982,
    },
  },
  {
    id: 'leads',
    eyebrow: 'Leads',
    title: 'Turn leads into revenue',
    body: 'A real-time dashboard of every opportunity. Track leads, prioritise follow-ups, and watch conversion rates climb with insights that drive the next action.',
    media: {
      mp4: '/assets/landing/leads.mp4',
      poster: '/assets/landing/leads-poster.jpg',
      width: 2982,
      height: 1724,
    },
  },
]
