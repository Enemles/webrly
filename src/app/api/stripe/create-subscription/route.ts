import { db } from "@/lib/db"
import stripe from "@/lib/stripe"
import { NextResponse } from "next/server"

export async function POST(req: Request){
  const { customerId, priceId } = await req.json()

  if (!customerId || !priceId) {
    return new Response('Missing customerId or priceId', { status: 400 })
  }
  const subscriptionExists = await db.agency.findFirst({
    where: {
      customerId
    },
    include: {
      Subscription: true
    }
  })

  try {
    if (subscriptionExists?.Subscription?.subscriptionId && subscriptionExists.Subscription.active) {
      //update subscription instead of creating a new one
      if(!subscriptionExists.Subscription.subscriptionId) {
        throw new Error('Could not find the subscriptionId to update')
      }
      console.log('Updating subscription')
      const currentSubscriptionDetails = await stripe.subscriptions.retrieve(
        subscriptionExists.Subscription.subscriptionId
      )

      const subscription = await stripe.subscriptions.update(
        subscriptionExists.Subscription.subscriptionId,
        {
          items : [
            {
              id: currentSubscriptionDetails.items.data[0].id,
              deleted: true,
            },
            {
              price: priceId
            }
          ],
          expand: ['latest_invoice.payment_intent'],
        }
      )
      
      // Gestion sécurisée du client_secret
      const clientSecret = subscription.latest_invoice 
        && typeof subscription.latest_invoice === 'object' 
        && subscription.latest_invoice.payment_intent
        && typeof subscription.latest_invoice.payment_intent === 'object'
        // @ts-ignore
        ? subscription.latest_invoice.payment_intent.client_secret
        : null

      return NextResponse.json({
        subscriptionId : subscription.id,
        clientSecret
      })
    } else {
      console.log('Creating subscription')
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: priceId
          }
        ],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription'
        },
        expand: ['latest_invoice.payment_intent'],
      })
      
      // Gestion sécurisée du client_secret
      const clientSecret = subscription.latest_invoice 
        && typeof subscription.latest_invoice === 'object' 
        && subscription.latest_invoice.payment_intent
        && typeof subscription.latest_invoice.payment_intent === 'object'
        // @ts-ignore
        ? subscription.latest_invoice.payment_intent.client_secret
        : null

      return NextResponse.json({
        subscriptionId : subscription.id,
        clientSecret
      })
    }
  } catch (error) {
    console.log('Error', error)
    return new NextResponse('Internal Server Error', {
      status: 500
    })
  }
}