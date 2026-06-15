import {
  Bell,
  CreditCard,
  Globe,
  ImageIcon,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface BentoItem {
  title: string
  description: string
  icon: LucideIcon
}

export const BENTO: BentoItem[] = [
  {
    title: 'Media library',
    description: 'Store, organise and reuse assets across every sub-account.',
    icon: ImageIcon,
  },
  {
    title: 'Contacts',
    description: 'Keep every client and lead in one organised place.',
    icon: Users,
  },
  {
    title: 'Notifications',
    description: 'Stay on top of activity across your agency in real time.',
    icon: Bell,
  },
  {
    title: 'Stripe Connect',
    description: 'Collect payments and rebill your clients automatically.',
    icon: CreditCard,
  },
  {
    title: 'Custom subdomains',
    description: 'Publish funnels and sites on your own branded domains.',
    icon: Globe,
  },
  {
    title: 'Team roles',
    description: 'Fine-grained, role-based permissions per member.',
    icon: ShieldCheck,
  },
]
