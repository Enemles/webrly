import Stripe from 'stripe'

export type SessionMetrics = {
  currency: string
  sessions: ProcessedSession[]
  totalClosedSessions: ProcessedSession[]
  totalPendingSessions: ProcessedSession[]
  net: number
  potentialIncome: number
  closingRate: number
}

export type ProcessedSession = {
  id: string
  status: string | null
  customer_details?: Stripe.Checkout.Session.CustomerDetails | null
  created: string
  amount_total: number
  url?: string | null
  metadata: Stripe.Metadata | null
}

export type DateRange = {
  startDate: number
  endDate: number
}

export type AnalyticsMetrics = {
  stripe: SessionMetrics | null
  subAccountsCount: number
  goal?: number
}

export type FunnelPerformanceMetric = {
  id: string
  name: string
  totalFunnelVisits: number
  FunnelPages: Array<{
    id: string
    visits: number
  }>
} 