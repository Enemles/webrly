import stripe from '@/lib/stripe'
import { DateRange, ProcessedSession, SessionMetrics } from '@/lib/types/analytics'
import Stripe from 'stripe'

/**
 * Récupère les informations du compte Stripe connecté
 */
export async function getStripeAccountInfo(connectAccountId: string) {
  try {
    const response = await stripe.accounts.retrieve({
      stripeAccount: connectAccountId,
    })
    return response
  } catch (error) {
    console.error('Erreur lors de la récupération du compte Stripe:', error)
    throw new Error('Impossible de récupérer les informations du compte Stripe')
  }
}

/**
 * Récupère les sessions de checkout Stripe pour une période donnée
 */
export async function getCheckoutSessions(
  connectAccountId: string,
  dateRange: DateRange,
  limit: number = 100
): Promise<Stripe.ApiList<Stripe.Checkout.Session>> {
  try {
    const checkoutSessions = await stripe.checkout.sessions.list(
      {
        created: { gte: dateRange.startDate, lte: dateRange.endDate },
        limit,
      },
      { stripeAccount: connectAccountId }
    )
    return checkoutSessions
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error)
    throw new Error('Impossible de récupérer les sessions de checkout')
  }
}

/**
 * Traite une session Stripe pour la formater
 */
export function processSession(session: Stripe.Checkout.Session): ProcessedSession {
  return {
    id: session.id,
    status: session.status,
    customer_details: session.customer_details,
    created: new Date(session.created * 1000).toLocaleDateString(),
    amount_total: session.amount_total ? session.amount_total / 100 : 0,
    url: session.url,
    metadata: session.metadata,
  }
}

/**
 * Filtre et traite les sessions par statut
 */
export function filterAndProcessSessions(
  sessions: Stripe.Checkout.Session[],
  statusFilter: 'complete' | 'pending'
): ProcessedSession[] {
  return sessions
    .filter((session) => {
      if (statusFilter === 'pending') {
        return session.status === 'open' || session.status === 'expired'
      }
      return session.status === 'complete'
    })
    .map(processSession)
}

/**
 * Calcule les métriques financières à partir des sessions
 */
export function calculateFinancialMetrics(
  closedSessions: ProcessedSession[],
  pendingSessions: ProcessedSession[],
  totalSessionsCount: number
) {
  const net = +closedSessions
    .reduce((total, session) => total + (session.amount_total || 0), 0)
    .toFixed(2)

  const potentialIncome = +pendingSessions
    .reduce((total, session) => total + (session.amount_total || 0), 0)
    .toFixed(2)

  const closingRate = totalSessionsCount > 0 
    ? +((closedSessions.length / totalSessionsCount) * 100).toFixed(2)
    : 0

  return { net, potentialIncome, closingRate }
}

/**
 * Service principal pour récupérer toutes les métriques Stripe
 */
export async function getStripeAnalytics(
  connectAccountId: string,
  dateRange: DateRange
): Promise<SessionMetrics> {
  // Récupération des informations du compte
  const accountInfo = await getStripeAccountInfo(connectAccountId)
  const currency = accountInfo.default_currency?.toUpperCase() || 'EUR'

  // Récupération des sessions
  const checkoutSessions = await getCheckoutSessions(connectAccountId, dateRange)
  const allSessions = checkoutSessions.data.map(processSession)

  // Filtrage et traitement des sessions
  const totalClosedSessions = filterAndProcessSessions(checkoutSessions.data, 'complete')
  const totalPendingSessions = filterAndProcessSessions(checkoutSessions.data, 'pending')

  // Calcul des métriques financières
  const { net, potentialIncome, closingRate } = calculateFinancialMetrics(
    totalClosedSessions,
    totalPendingSessions,
    checkoutSessions.data.length
  )

  return {
    currency,
    sessions: allSessions,
    totalClosedSessions,
    totalPendingSessions,
    net,
    potentialIncome,
    closingRate,
  }
} 