// TODO(content): chiffres PROVISOIRES — à remplacer par de vrais nombres.

export interface Stat {
  value: number
  suffix?: string
  label: string
}

export const STATS: Stat[] = [
  { value: 1200, suffix: '+', label: 'Agencies' },
  { value: 50000, suffix: '+', label: 'Sub-accounts' },
  { value: 2, suffix: 'M+', label: 'Leads tracked' },
  { value: 99.9, suffix: '%', label: 'Uptime' },
]
