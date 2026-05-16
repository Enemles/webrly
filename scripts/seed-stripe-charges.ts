/**
 * Génère des charges + checkout sessions test sur un compte Stripe Connect.
 *
 * Usage :
 *   STRIPE_SECRET_KEY=sk_test_... \
 *   CONNECT_ACCOUNT_ID=acct_... \
 *   PAYMENT_COUNT=30 \
 *   SESSION_COUNT=8 \
 *   npx -y tsx scripts/seed-stripe-charges.ts
 */
import Stripe from 'stripe'

const KEY = process.env.STRIPE_SECRET_KEY
const ACCT = process.env.CONNECT_ACCOUNT_ID
const PAYMENT_COUNT = Number(process.env.PAYMENT_COUNT ?? '30')
const SESSION_COUNT = Number(process.env.SESSION_COUNT ?? '8')

if (!KEY) throw new Error('STRIPE_SECRET_KEY manquant')
if (!ACCT) throw new Error('CONNECT_ACCOUNT_ID manquant (ex: acct_1QNsyJBa1q4VAXiS)')

const stripe = new Stripe(KEY, { apiVersion: '2024-04-10' as Stripe.LatestApiVersion })

const PRODUCTS = [
  { label: 'Coffret Découverte AOP', price: 4900 },
  { label: 'Box Soldes d\'Été', price: 6500 },
  { label: 'Collection Automne — Veste', price: 18900 },
  { label: 'Capsule Lancement — Pull', price: 12500 },
  { label: 'Pack Ambassadeur', price: 5000 },
  { label: 'Dock X2 Pro', price: 27900 },
  { label: 'Hub USB-C Premium', price: 8900 },
  { label: 'Câble Magnétique 1m', price: 1900 },
  { label: 'Pack Lot 5 huiles', price: 14500 },
  { label: 'Bocaux Premium x3', price: 3200 },
]

const CUSTOMERS = [
  'sophie.martin', 'lucas.dubois', 'emma.bernard', 'noah.thomas', 'lina.robert',
  'arthur.petit', 'jade.durand', 'hugo.leroy', 'inès.moreau', 'tom.simon',
  'chloe.laurent', 'theo.lefebvre', 'manon.michel', 'leo.garcia', 'sarah.david',
  'jules.bertrand', 'mila.roux', 'gabriel.vincent', 'alice.fournier', 'adam.morel',
]

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const daysAgoUnix = (n: number) => Math.floor((Date.now() - n * 24 * 3600 * 1000) / 1000)

async function createPaymentIntent(i: number) {
  const product = pick(PRODUCTS)
  const qty = randInt(1, 3)
  const amount = product.price * qty
  const customer = pick(CUSTOMERS)

  const pi = await stripe.paymentIntents.create(
    {
      amount,
      currency: 'eur',
      payment_method: 'pm_card_visa',
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      description: `${product.label} ×${qty}`,
      receipt_email: `${customer}@example.com`,
      metadata: { demo_seed: 'true', product: product.label, customer },
    },
    { stripeAccount: ACCT },
  )
  return pi
}

async function createCheckoutSession(i: number) {
  const product = pick(PRODUCTS)
  const customer = pick(CUSTOMERS)

  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: randInt(1, 2),
          price_data: {
            currency: 'eur',
            unit_amount: product.price,
            product_data: { name: product.label },
          },
        },
      ],
      success_url: 'https://webrly.selmene.dev/site',
      cancel_url: 'https://webrly.selmene.dev/site',
      customer_email: `${customer}@example.com`,
      metadata: { demo_seed: 'true' },
    },
    { stripeAccount: ACCT },
  )
  return session
}

async function main() {
  console.log(`\n💳 Création de ${PAYMENT_COUNT} PaymentIntents confirmés sur ${ACCT}…\n`)
  let succeeded = 0
  let failed = 0
  for (let i = 0; i < PAYMENT_COUNT; i++) {
    try {
      const pi = await createPaymentIntent(i)
      const ok = pi.status === 'succeeded'
      console.log(`  ${ok ? '✅' : '⚠️ '} #${i + 1}  ${pi.id}  ${pi.amount / 100}€  status=${pi.status}`)
      if (ok) succeeded++; else failed++
    } catch (e: any) {
      failed++
      console.log(`  ❌ #${i + 1}  ${e.message}`)
    }
  }

  console.log(`\n🛒 Création de ${SESSION_COUNT} Checkout Sessions (pending) sur ${ACCT}…\n`)
  let sessOk = 0
  for (let i = 0; i < SESSION_COUNT; i++) {
    try {
      const s = await createCheckoutSession(i)
      console.log(`  ✅ #${i + 1}  ${s.id}  ${(s.amount_total ?? 0) / 100}€  status=${s.status}`)
      sessOk++
    } catch (e: any) {
      console.log(`  ❌ #${i + 1}  ${e.message}`)
    }
  }

  console.log(`\n✅ Terminé : ${succeeded}/${PAYMENT_COUNT} payments OK, ${sessOk}/${SESSION_COUNT} sessions créées (${failed} erreurs).`)
  console.log(`\n   Vérifie dans Stripe Dashboard test mode (compte ${ACCT}) :`)
  console.log(`   https://dashboard.stripe.com/${ACCT}/test/payments`)
  console.log(`   https://dashboard.stripe.com/${ACCT}/test/payments/checkout/sessions`)
}

main().catch(e => {
  console.error('❌', e)
  process.exit(1)
})
