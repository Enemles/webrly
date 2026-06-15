import type { ProcessedSession, SessionMetrics } from '@/lib/types/analytics'

/**
 * Mode démo : rend le dashboard sous-compte impressionnant pour enregistrer les
 * vidéos de la landing, SANS compte Stripe connecté.
 * Les métriques "argent" (income, conversions, paniers, checkout, historique)
 * viennent de Stripe et ne sont donc pas seedables en DB : on les mocke ici.
 * (Pipeline Value + Funnel Performance, eux, restent alimentés par la vraie DB
 * seedée — cf. prisma/seed.ts.)
 *
 * Activation : `NEXT_PUBLIC_DEMO_MODE=true` dans .env (puis redémarrer le dev).
 */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
}

const AMOUNTS = [49, 99, 149, 199, 299, 390, 490, 690, 890, 1290, 1990]

const CUSTOMERS = [
  'Léa Martin', 'Hugo Bernard', 'Camille Dubois', 'Lucas Moreau', 'Emma Laurent',
  'Nathan Simon', 'Chloé Garcia', 'Louis Roux', 'Manon Fontaine', 'Jules Mercier',
  'Sarah Lefèvre', 'Tom Girard', 'Inès Bonnet', 'Adam Rousseau', 'Jade Henry',
]

function customerDetails(i: number): ProcessedSession['customer_details'] {
  const name = CUSTOMERS[i % CUSTOMERS.length]
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]+/g, '.')
  return {
    address: null,
    email: `${slug}${i % 7}@example.com`,
    name,
    phone: null,
    tax_exempt: 'none',
    tax_ids: [],
  }
}

/**
 * Métriques Stripe mockées : déterministes (stables au refresh, pour un
 * enregistrement propre) et volontairement flatteuses.
 */
export function buildDemoStripeMetrics(): SessionMetrics {
  const N = 210
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1).getTime()
  const span = Math.max(now.getTime() - start, 86_400_000)

  const sessions: ProcessedSession[] = Array.from({ length: N }, (_, i) => {
    const complete = i % 10 < 7 // ~70% de conversions
    const amount = AMOUNTS[(i * 7) % AMOUNTS.length]
    const created = new Date(start + (i / (N - 1)) * span).toLocaleDateString()
    return {
      id: `cs_demo_${i}`,
      status: complete ? 'complete' : 'open',
      customer_details: customerDetails(i),
      created,
      amount_total: amount,
      url: null,
      metadata: {},
    }
  })

  const totalClosedSessions = sessions.filter((s) => s.status === 'complete')
  const totalPendingSessions = sessions.filter((s) => s.status !== 'complete')
  const net = +totalClosedSessions.reduce((t, s) => t + s.amount_total, 0).toFixed(2)
  const potentialIncome = +totalPendingSessions
    .reduce((t, s) => t + s.amount_total, 0)
    .toFixed(2)
  const closingRate = +((totalClosedSessions.length / sessions.length) * 100).toFixed(2)

  return {
    currency: 'EUR',
    sessions,
    totalClosedSessions,
    totalPendingSessions,
    net,
    potentialIncome,
    closingRate,
  }
}
