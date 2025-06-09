import { db } from '@/lib/db'
import { AnalyticsMetrics, DateRange, FunnelPerformanceMetric } from '@/lib/types/analytics'
import { getStripeAnalytics } from './stripe'

/**
 * Génère une plage de dates pour l'année en cours
 */
export function getCurrentYearDateRange(): DateRange {
  const currentYear = new Date().getFullYear()
  const startDate = new Date(`${currentYear}-01-01T00:00:00Z`).getTime() / 1000
  const endDate = new Date(`${currentYear}-12-31T23:59:59Z`).getTime() / 1000
  
  return { startDate, endDate }
}

/**
 * Récupère les métriques analytics pour une agence
 */
export async function getAgencyAnalytics(agencyId: string): Promise<AnalyticsMetrics> {
  // Récupération des détails de l'agence
  const agencyDetails = await db.agency.findUnique({
    where: { id: agencyId },
  })

  if (!agencyDetails) {
    throw new Error('Agence non trouvée')
  }

  // Récupération du nombre de subaccounts
  const subaccounts = await db.subAccount.findMany({
    where: { agencyId },
  })

  let stripeMetrics = null

  // Si l'agence a un compte Stripe connecté, récupérer les métriques
  if (agencyDetails.connectAccountId) {
    try {
      const dateRange = getCurrentYearDateRange()
      stripeMetrics = await getStripeAnalytics(agencyDetails.connectAccountId, dateRange)
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques Stripe:', error)
      // On continue sans les métriques Stripe plutôt que de tout faire planter
    }
  }

  return {
    stripe: stripeMetrics,
    subAccountsCount: subaccounts.length,
    goal: agencyDetails.goal,
  }
}

/**
 * Récupère les métriques analytics pour un subaccount
 */
export async function getSubaccountAnalytics(subaccountId: string): Promise<AnalyticsMetrics> {
  // Récupération des détails du subaccount
  const subaccountDetails = await db.subAccount.findUnique({
    where: { id: subaccountId },
  })

  if (!subaccountDetails) {
    throw new Error('Subaccount non trouvé')
  }

  let stripeMetrics = null

  // Si le subaccount a un compte Stripe connecté, récupérer les métriques
  if (subaccountDetails.connectAccountId) {
    try {
      const dateRange = getCurrentYearDateRange()
      stripeMetrics = await getStripeAnalytics(subaccountDetails.connectAccountId, dateRange)
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques Stripe:', error)
    }
  }

  return {
    stripe: stripeMetrics,
    subAccountsCount: 0, // Les subaccounts n'ont pas de sous-comptes
  }
}

/**
 * Récupère les métriques de performance des funnels
 */
export async function getFunnelPerformanceMetrics(subaccountId: string): Promise<FunnelPerformanceMetric[]> {
  const funnels = await db.funnel.findMany({
    where: { subAccountId: subaccountId },
    include: { FunnelPages: true },
  })

  return funnels.map((funnel) => ({
    id: funnel.id,
    name: funnel.name,
    totalFunnelVisits: funnel.FunnelPages.reduce(
      (total, page) => total + page.visits,
      0
    ),
    FunnelPages: funnel.FunnelPages.map(page => ({
      id: page.id,
      visits: page.visits,
    })),
  }))
} 