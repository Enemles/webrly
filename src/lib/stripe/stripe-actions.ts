'use server'

import Stripe from "stripe"
import { db } from "../db"
import stripe from "."

export const subscriptionCreated = async (
  subscription: Stripe.Subscription, 
  customerId : string
) => {
  try {
    const agency = await db.agency.findFirst({
      where: {
        customerId
      },
      include: {
        Subscription: true
      }
    })
    if (!agency){
      throw new Error('Agency not found to upsert subscription')
    }

    const data = {
      active: subscription.status === 'active',
      agencyId: agency.id,
      customerId,
      currentPeriodEndDate: new Date(subscription.current_period_end * 1000),
      // @ts-ignore
      priceId: subscription.plan.id,
      subscriptionId: subscription.id,
      // @ts-ignore
      plan: subscription.plan.id,
    }

    const res = await db.subscription.upsert({
      where: {
        agencyId: agency.id
      },
      create: data,
      update: data
    })
    console.log(`Subscription created for ${subscription.id}`)

    // return res
  } catch (error) {
    console.error(error)
    throw new Error('Error upserting subscription')
  }
}

export const getConnectAccountProducts = async (stripeAccount : string) => {
  try {
    const products = await stripe.products.list({
      limit: 50,
      expand: ['data.default_price']
    },{
      stripeAccount
    })
    return products.data
  } catch (error) {
    console.error(error)
    throw new Error('Error fetching products')
  }
}