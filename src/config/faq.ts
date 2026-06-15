// TODO(content): valider/ajuster la copie FAQ avec l'utilisateur.

export interface FaqItem {
  q: string
  a: string
}

export const FAQ: FaqItem[] = [
  {
    q: 'What is Webrly?',
    a: 'Webrly is an all-in-one platform for agencies: build client sites and funnels, manage pipelines, give your team scoped access, and track every lead — all from one place.',
  },
  {
    q: 'Can I try Webrly for free?',
    a: 'Yes. The Starter plan is free — 3 sub-accounts, 2 team members and unlimited pipelines, with no card required.',
  },
  {
    q: 'How does billing work?',
    a: 'Paid plans are billed monthly or yearly via Stripe. You can upgrade, downgrade or cancel anytime, and yearly billing saves you 20%.',
  },
  {
    q: 'Can I publish to my own subdomains?',
    a: 'Absolutely. Publish funnels and websites to custom subdomains, so every client site lives on its own branded address.',
  },
  {
    q: 'Do you support multiple team members and roles?',
    a: 'Yes. Invite your whole team with role-based permissions, scoped per sub-account, so everyone sees exactly what they should.',
  },
  {
    q: 'Can I collect payments from my clients?',
    a: 'Yes, through Stripe Connect — collect payments and rebill your clients directly from Webrly.',
  },
  {
    q: 'Is my data secure?',
    a: 'Your data is isolated per sub-account with role-based access control, so information stays private to the people who need it.',
  },
  {
    q: 'What happens if I hit my plan limits?',
    a: "You'll be prompted to upgrade — your data is never deleted, and you can move to a larger plan in a click.",
  },
]
