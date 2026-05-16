import { PrismaClient, Role } from '@prisma/client'
import { randomUUID } from 'crypto'

const db = new PrismaClient()

const CLERK_USER_ID = process.env.SEED_CLERK_USER_ID
const CLERK_USER_EMAIL = process.env.SEED_CLERK_USER_EMAIL
const SEED_NAME = process.env.SEED_NAME || 'Démo Owner'
const SEED_AVATAR =
  process.env.SEED_AVATAR ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent('Demo Owner')}&size=256&background=6366f1&color=ffffff&bold=true&format=png`

const AGENCY_NAME = 'Pulse Commerce — Démo'
const AGENCY_LOGO_COLOR = '6366f1' // indigo
const logo = (name: string, bg: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=256&background=${bg}&color=ffffff&bold=true&format=png`
const mediaImg = (label: string, bg: string) =>
  `https://placehold.co/800x600/${bg}/ffffff/png?text=${encodeURIComponent(label)}`

function fail(msg: string): never {
  console.error(`\n❌ ${msg}\n`)
  process.exit(1)
}

if (!CLERK_USER_ID) fail('SEED_CLERK_USER_ID manquant (le userId Clerk, ex: user_2abc...)')
if (!CLERK_USER_EMAIL) fail('SEED_CLERK_USER_EMAIL manquant')

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000)

const FIRST_NAMES = [
  'Camille', 'Léa', 'Hugo', 'Manon', 'Lucas', 'Emma', 'Nathan', 'Chloé',
  'Théo', 'Sarah', 'Antoine', 'Jade', 'Maxime', 'Inès', 'Noah', 'Louise',
  'Arthur', 'Romane', 'Yanis', 'Zoé', 'Adam', 'Alice', 'Gabriel', 'Mila',
  'Raphaël', 'Lina', 'Jules', 'Anna', 'Tom', 'Léna',
]
const LAST_NAMES = [
  'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit',
  'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel',
  'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel',
  'Girard', 'André', 'Mercier', 'Blanc',
]
const EMAIL_DOMAINS = ['gmail.com', 'outlook.fr', 'orange.fr', 'free.fr', 'icloud.com', 'proton.me']

const slug = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const TAG_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']

function makeContact(subAccountId: string) {
  const first = pick(FIRST_NAMES)
  const last = pick(LAST_NAMES)
  return {
    id: randomUUID(),
    name: `${first} ${last}`,
    email: `${slug(first)}.${slug(last)}${randInt(1, 99)}@${pick(EMAIL_DOMAINS)}`,
    subAccountId,
    createdAt: daysAgo(randInt(0, 90)),
    updatedAt: daysAgo(randInt(0, 30)),
  }
}

type FunnelSpec = {
  name: string
  subDomain: string
  description: string
  hero: { title: string; subtitle: string; cta: string; bg: string }
}

type BoutiqueSpec = {
  name: string
  slug: string
  brandColor: string
  industry: string
  city: string
  zipCode: string
  email: string
  phone: string
  pipelineName: string
  funnels: FunnelSpec[]
  tags: string[]
}

const BOUTIQUES: BoutiqueSpec[] = [
  {
    name: 'Maison Olive',
    slug: 'maison-olive',
    brandColor: 'd97706',
    industry: 'Épicerie fine méditerranéenne',
    city: 'Marseille',
    zipCode: '13001',
    email: 'contact@maison-olive.fr',
    phone: '+33 4 91 00 00 00',
    pipelineName: 'Cycle de vente B2C',
    tags: ['VIP', 'Nouveau client', 'Abonné newsletter', 'Black Friday', 'Restaurant', 'Cadeau entreprise'],
    funnels: [
      {
        name: 'Coffret Découverte',
        subDomain: 'coffret-decouverte',
        description: 'Landing page pour notre coffret signature, 6 huiles d\'olive AOP.',
        hero: {
          title: 'Le goût du Sud, en coffret',
          subtitle: '6 huiles d\'olive AOP sélectionnées par nos producteurs.',
          cta: 'Découvrir le coffret →',
          bg: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
        },
      },
      {
        name: 'Soldes d\'Été',
        subDomain: 'soldes-ete-olive',
        description: 'Funnel saisonnier soldes d\'été — collection bocaux & condiments.',
        hero: {
          title: 'Soldes d\'été — jusqu\'à -40%',
          subtitle: 'Bocaux artisanaux, condiments rares, livraison offerte dès 50€.',
          cta: 'Voir les promos →',
          bg: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
        },
      },
    ],
  },
  {
    name: 'Bloom Studio',
    slug: 'bloom-studio',
    brandColor: 'be185d',
    industry: 'Mode et accessoires éthiques',
    city: 'Paris',
    zipCode: '75011',
    email: 'hello@bloom-studio.com',
    phone: '+33 1 42 00 00 00',
    pipelineName: 'Pipeline collections',
    tags: ['Pré-commande', 'Influenceur', 'Boutique partenaire', 'Édition limitée', 'Retour', 'VIP'],
    funnels: [
      {
        name: 'Collection Automne',
        subDomain: 'collection-automne',
        description: 'Lancement de la collection automne — drop principal de la saison.',
        hero: {
          title: 'Collection Automne — Drop 02',
          subtitle: 'Pièces tissées en France, en édition limitée à 200 exemplaires.',
          cta: 'Réserver une pièce →',
          bg: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
        },
      },
      {
        name: 'Capsule Lancement',
        subDomain: 'capsule-bloom',
        description: 'Capsule exclusive pour la liste d\'attente — accès anticipé 48h.',
        hero: {
          title: 'Accès anticipé — 48h pour vous',
          subtitle: 'Notre capsule lancement, en avant-première pour les abonnés.',
          cta: 'Accéder à la capsule →',
          bg: 'linear-gradient(135deg, #f472b6 0%, #be185d 100%)',
        },
      },
      {
        name: 'Programme Ambassadeur',
        subDomain: 'ambassadeur-bloom',
        description: 'Programme de cooptation pour les ambassadeurs de la marque.',
        hero: {
          title: 'Devenez Ambassadeur Bloom',
          subtitle: '15% de commission sur chaque vente parrainée, à vie.',
          cta: 'Candidater →',
          bg: 'linear-gradient(135deg, #34d399 0%, #047857 100%)',
        },
      },
    ],
  },
  {
    name: 'Pixel Pro',
    slug: 'pixel-pro',
    brandColor: '1d4ed8',
    industry: 'Accessoires tech premium',
    city: 'Lyon',
    zipCode: '69002',
    email: 'support@pixelpro.io',
    phone: '+33 4 72 00 00 00',
    pipelineName: 'Funnel ventes B2C',
    tags: ['Précommande', 'Live', 'Retour SAV', 'Gros panier', 'B2B', 'Abonné'],
    funnels: [
      {
        name: 'Black Friday Tech',
        subDomain: 'black-friday-pixel',
        description: 'Page dédiée au Black Friday, -50% sur la sélection.',
        hero: {
          title: 'Black Friday — -50% sur tout',
          subtitle: 'Notre meilleure offre de l\'année, 72h seulement.',
          cta: 'Voir les deals →',
          bg: 'linear-gradient(135deg, #1f2937 0%, #000000 100%)',
        },
      },
      {
        name: 'Précommande X2 Pro',
        subDomain: 'precommande-x2',
        description: 'Précommande du dock USB-C X2 Pro — livraison janvier.',
        hero: {
          title: 'X2 Pro — Précommande ouverte',
          subtitle: 'Le dock USB-C qui va remplacer votre setup. -25% en précommande.',
          cta: 'Précommander →',
          bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        },
      },
    ],
  },
]

function bodyContent(funnel: FunnelSpec): string {
  return JSON.stringify([
    {
      id: '__body',
      name: 'Body',
      type: '__body',
      styles: { backgroundColor: 'white' },
      content: [
        {
          id: randomUUID(),
          name: 'Hero',
          type: 'section',
          styles: {
            background: funnel.hero.bg,
            color: 'white',
            padding: '80px 24px',
            minHeight: '480px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '24px',
          },
          content: [
            {
              id: randomUUID(),
              name: 'Title',
              type: 'text',
              styles: { fontSize: '52px', fontWeight: '800', lineHeight: '1.1', margin: '0', maxWidth: '720px' },
              content: { innerText: funnel.hero.title },
            },
            {
              id: randomUUID(),
              name: 'Subtitle',
              type: 'text',
              styles: { fontSize: '20px', margin: '0', maxWidth: '600px', opacity: '0.92' },
              content: { innerText: funnel.hero.subtitle },
            },
            {
              id: randomUUID(),
              name: 'CTA',
              type: 'link',
              styles: {
                padding: '14px 32px',
                backgroundColor: 'white',
                color: '#111827',
                borderRadius: '999px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '16px',
                marginTop: '12px',
                display: 'inline-block',
              },
              content: { href: '#', innerText: funnel.hero.cta },
            },
          ],
        },
        {
          id: randomUUID(),
          name: 'Pitch',
          type: 'section',
          styles: {
            padding: '64px 24px',
            backgroundColor: 'white',
            textAlign: 'center',
            color: '#111827',
          },
          content: [
            {
              id: randomUUID(),
              name: 'Pitch text',
              type: 'text',
              styles: { fontSize: '24px', fontWeight: '500', maxWidth: '720px', margin: '0 auto', lineHeight: '1.5' },
              content: {
                innerText: funnel.description,
              },
            },
          ],
        },
      ],
    },
  ])
}

function makeLanes() {
  const stages = [
    { name: 'Nouveau lead', color: '#94a3b8' },
    { name: 'Premier contact', color: '#3b82f6' },
    { name: 'Devis envoyé', color: '#f59e0b' },
    { name: 'Négociation', color: '#a855f7' },
    { name: 'Gagné', color: '#22c55e' },
    { name: 'Perdu', color: '#ef4444' },
  ]
  return stages.map((s, i) => ({
    id: randomUUID(),
    name: s.name,
    color: s.color,
    order: i,
    createdAt: daysAgo(60),
    updatedAt: daysAgo(randInt(0, 30)),
  }))
}

const AGENCY_DEFAULT_SIDEBAR = (agencyId: string) => [
  { name: 'Dashboard', icon: 'category' as const, link: `/agency/${agencyId}` },
  { name: 'Launchpad', icon: 'clipboardIcon' as const, link: `/agency/${agencyId}/launchpad` },
  { name: 'Billing', icon: 'payment' as const, link: `/agency/${agencyId}/billing` },
  { name: 'Settings', icon: 'settings' as const, link: `/agency/${agencyId}/settings` },
  { name: 'Sub Accounts', icon: 'person' as const, link: `/agency/${agencyId}/all-subaccounts` },
  { name: 'Team', icon: 'shield' as const, link: `/agency/${agencyId}/team` },
]

const SUBACCOUNT_DEFAULT_SIDEBAR = (subId: string) => [
  { name: 'Dashboard', icon: 'category' as const, link: `/subaccount/${subId}` },
  { name: 'Launchpad', icon: 'clipboardIcon' as const, link: `/subaccount/${subId}/launchpad` },
  { name: 'Settings', icon: 'settings' as const, link: `/subaccount/${subId}/settings` },
  { name: 'Funnels', icon: 'pipelines' as const, link: `/subaccount/${subId}/funnels` },
  { name: 'Media', icon: 'database' as const, link: `/subaccount/${subId}/media` },
  { name: 'Pipelines', icon: 'flag' as const, link: `/subaccount/${subId}/pipelines` },
  { name: 'Contacts', icon: 'person' as const, link: `/subaccount/${subId}/contacts` },
]

async function cleanup() {
  console.log('🧹 Nettoyage des anciennes données démo…')
  const oldAgencies = await db.agency.findMany({ where: { name: AGENCY_NAME } })
  for (const ag of oldAgencies) {
    await db.user.updateMany({ where: { agencyId: ag.id }, data: { agencyId: null } })
    await db.agency.delete({ where: { id: ag.id } })
    console.log(`  ↳ Supprimé agence ${ag.id}`)
  }

  const ghostFunnels = await db.funnel.findMany({
    where: { subDomainName: { in: BOUTIQUES.flatMap(b => b.funnels.map(f => f.subDomain)) } },
  })
  for (const f of ghostFunnels) {
    await db.funnel.delete({ where: { id: f.id } })
    console.log(`  ↳ Supprimé funnel orphelin ${f.subDomainName}`)
  }
}

async function seed() {
  await cleanup()

  console.log('\n👤 Upsert agency owner…')
  await db.user.upsert({
    where: { email: CLERK_USER_EMAIL! },
    update: { name: SEED_NAME, avatarUrl: SEED_AVATAR, role: Role.AGENCY_OWNER },
    create: {
      id: CLERK_USER_ID!,
      email: CLERK_USER_EMAIL!,
      name: SEED_NAME,
      avatarUrl: SEED_AVATAR,
      role: Role.AGENCY_OWNER,
    },
  })

  console.log('\n🏢 Création agence Pulse Commerce…')
  const agencyId = randomUUID()
  await db.agency.create({
    data: {
      id: agencyId,
      name: AGENCY_NAME,
      agencyLogo: logo('Pulse Commerce', AGENCY_LOGO_COLOR),
      companyEmail: 'studio@pulse-commerce.fr',
      companyPhone: '+33 1 86 00 00 00',
      address: '12 rue de la Paix',
      city: 'Paris',
      zipCode: '75002',
      state: 'Île-de-France',
      country: 'France',
      goal: 12,
      whiteLabel: true,
      users: { connect: { email: CLERK_USER_EMAIL! } },
      SidebarOption: { create: AGENCY_DEFAULT_SIDEBAR(agencyId) },
    },
  })
  console.log(`  ↳ agencyId = ${agencyId}`)

  for (const b of BOUTIQUES) {
    console.log(`\n🛍  ${b.name}…`)
    const subId = randomUUID()
    await db.subAccount.create({
      data: {
        id: subId,
        agencyId,
        name: b.name,
        subAccountLogo: logo(b.name, b.brandColor),
        companyEmail: b.email,
        companyPhone: b.phone,
        address: `${randInt(1, 99)} rue ${pick(['de la République', 'des Lilas', 'du Faubourg', 'Saint-Honoré', 'Voltaire'])}`,
        city: b.city,
        zipCode: b.zipCode,
        state: b.city === 'Paris' ? 'Île-de-France' : b.city === 'Lyon' ? 'Auvergne-Rhône-Alpes' : 'PACA',
        country: 'France',
        goal: randInt(8, 20),
        SidebarOption: { create: SUBACCOUNT_DEFAULT_SIDEBAR(subId) },
        Permissions: {
          create: { id: randomUUID(), email: CLERK_USER_EMAIL!, access: true },
        },
      },
    })

    const tags = await db.$transaction(
      b.tags.map(t => db.tag.create({
        data: {
          id: randomUUID(),
          name: t,
          color: pick(TAG_COLORS),
          subAccountId: subId,
        },
      })),
    )
    console.log(`  ↳ ${tags.length} tags`)

    const contactCount = randInt(15, 22)
    const contacts = await db.$transaction(
      Array.from({ length: contactCount }, () => {
        const c = makeContact(subId)
        return db.contact.create({ data: c })
      }),
    )
    console.log(`  ↳ ${contacts.length} contacts`)

    const pipelineId = randomUUID()
    await db.pipeline.create({
      data: {
        id: pipelineId,
        name: b.pipelineName,
        subAccountId: subId,
        Lane: { create: makeLanes() },
      },
    })

    const lanes = await db.lane.findMany({ where: { pipelineId }, orderBy: { order: 'asc' } })
    const TICKETS_PER_BOUTIQUE = randInt(18, 28)
    const ticketSubjects = [
      'Commande #', 'Devis lot ', 'Demande échantillon ', 'Reorder client ', 'Lead Instagram ',
      'Salon pro ', 'Marketplace ', 'Boutique partenaire ', 'Newsletter conversion ', 'Réclamation #',
    ]
    for (let i = 0; i < TICKETS_PER_BOUTIQUE; i++) {
      const lane = pick(lanes)
      const customer = pick(contacts)
      const subjectBase = pick(ticketSubjects)
      const tagSet = new Set<string>()
      while (tagSet.size < Math.min(2, tags.length)) tagSet.add(pick(tags).id)
      await db.ticket.create({
        data: {
          id: randomUUID(),
          name: `${subjectBase}${randInt(1000, 9999)}`,
          description: pick([
            'Premier contact via le formulaire de la landing.',
            'Demande de devis sur 50 unités.',
            'Suivi après email de relance, attend retour.',
            'Renvoi catalogue + tarif pro.',
            'Client récurrent, à fidéliser.',
            'Lead chaud venu du salon.',
            null,
          ]),
          value: pick([null, 89, 199, 349, 540, 890, 1450, 2200, 3800]),
          laneId: lane.id,
          order: i,
          customerId: customer.id,
          Tags: { connect: Array.from(tagSet).map(id => ({ id })) },
          createdAt: daysAgo(randInt(0, 60)),
          updatedAt: daysAgo(randInt(0, 14)),
        },
      })
    }
    console.log(`  ↳ ${TICKETS_PER_BOUTIQUE} tickets dans ${lanes.length} lanes`)

    for (let i = 0; i < b.funnels.length; i++) {
      const f = b.funnels[i]
      const funnelId = randomUUID()
      await db.funnel.create({
        data: {
          id: funnelId,
          subAccountId: subId,
          name: f.name,
          description: f.description,
          published: true,
          subDomainName: f.subDomain,
          favicon: null,
          liveProducts: '[]',
          FunnelPages: {
            create: [
              {
                id: randomUUID(),
                name: 'Home',
                pathName: '',
                order: 0,
                visits: randInt(120, 4800),
                content: bodyContent(f),
              },
              {
                id: randomUUID(),
                name: 'Merci',
                pathName: 'thank-you',
                order: 1,
                visits: randInt(20, 400),
                content: JSON.stringify([
                  {
                    id: '__body',
                    name: 'Body',
                    type: '__body',
                    styles: { backgroundColor: '#f9fafb' },
                    content: [
                      {
                        id: randomUUID(),
                        name: 'Section',
                        type: 'section',
                        styles: { padding: '120px 24px', textAlign: 'center', color: '#111827' },
                        content: [
                          {
                            id: randomUUID(),
                            name: 'Title',
                            type: 'text',
                            styles: { fontSize: '40px', fontWeight: '800', margin: '0 0 16px' },
                            content: { innerText: 'Merci !' },
                          },
                          {
                            id: randomUUID(),
                            name: 'Para',
                            type: 'text',
                            styles: { fontSize: '18px', color: '#4b5563', margin: '0' },
                            content: { innerText: 'Votre demande a bien été enregistrée. Nous revenons vers vous sous 24h.' },
                          },
                        ],
                      },
                    ],
                  },
                ]),
              },
            ],
          },
        },
      })
    }
    console.log(`  ↳ ${b.funnels.length} funnels publiés (${b.funnels.map(f => f.subDomain).join(', ')})`)

    const mediaCount = randInt(4, 7)
    await db.$transaction(
      Array.from({ length: mediaCount }, (_, i) => db.media.create({
        data: {
          id: randomUUID(),
          subAccountId: subId,
          name: `${b.slug}-asset-${i + 1}.jpg`,
          type: 'image/jpeg',
          link: `${mediaImg(`${b.name} #${i + 1}`, b.brandColor)}&v=${randomUUID().slice(0, 6)}`,
          createdAt: daysAgo(randInt(0, 45)),
        },
      })),
    )
    console.log(`  ↳ ${mediaCount} médias`)
  }

  console.log('\n🔔 Notifications…')
  const user = await db.user.findUnique({ where: { email: CLERK_USER_EMAIL! } })
  const subs = await db.subAccount.findMany({ where: { agencyId } })
  const events = [
    'a créé un nouveau funnel',
    'a ajouté 3 nouveaux contacts',
    'a déplacé un ticket vers Gagné',
    'a publié une nouvelle landing',
    'a synchronisé son compte Stripe',
    'a invité un membre dans l\'équipe',
  ]
  for (let i = 0; i < 10; i++) {
    await db.notification.create({
      data: {
        id: randomUUID(),
        notification: `${user!.name} | ${pick(events)}`,
        agencyId,
        subAccountId: pick(subs).id,
        userId: user!.id,
        createdAt: daysAgo(randInt(0, 14)),
      },
    })
  }

  console.log('\n✅ Seed terminé.')
  console.log(`\n   Connecte-toi avec : ${CLERK_USER_EMAIL}`)
  console.log(`   Agence : ${AGENCY_NAME} (id ${agencyId})`)
  console.log('\n   Funnels publiés (HTTPS via Traefik wildcard) :')
  for (const b of BOUTIQUES) {
    for (const f of b.funnels) {
      console.log(`     • ${f.name.padEnd(28)} → https://${f.subDomain}.webrly.selmene.dev`)
    }
  }
}

seed()
  .catch(e => {
    console.error('\n❌ Seed a échoué :')
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
