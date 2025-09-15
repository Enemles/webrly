'use client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { PRICING } from "@/config/pricing";
import { useModal } from '@/providers/modal-provider'
import { Plan } from '@prisma/client'
import { StripeElementsOptions } from '@stripe/stripe-js'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe/stripe-client'
import Loading from '@/components/global/loading'
import SubscriptionForm from '.'

type Props = {
  customerId: string
  planExists: boolean
}

const SubscriptionFormWrapper = ({ customerId, planExists }: Props) => {
  const { data, setClose } = useModal()
  const router = useRouter()
  const [selectedPriceId, setSelectedPriceId] = useState<Plan | ''>(
    data?.plans?.defaultPriceId || ''
  )
  const [subscription, setSubscription] = useState<{
    subscriptionId: string
    clientSecret: string | null
  }>({ subscriptionId: '', clientSecret: null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const options: StripeElementsOptions = useMemo(
    () => ({
      clientSecret: subscription?.clientSecret || undefined,
      appearance: {
        theme: 'flat',
      },
    }),
    [subscription]
  )

  useEffect(() => {
    if (!selectedPriceId) return
    
    const createSecret = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const subscriptionResponse = await fetch(
          '/api/stripe/create-subscription',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customerId,
              priceId: selectedPriceId,
            }),
          }
        )
        
        if (!subscriptionResponse.ok) {
          const errorData = await subscriptionResponse.json().catch(() => ({}))
          console.error('Subscription error:', errorData)
          throw new Error(errorData.message || 'Failed to create subscription')
        }
        
        const subscriptionResponseData = await subscriptionResponse.json()
        
        setSubscription({
          clientSecret: subscriptionResponseData.clientSecret,
          subscriptionId: subscriptionResponseData.subscriptionId,
        })
        
        // Si clientSecret est null, c'est que la souscription est déjà active
        if (!subscriptionResponseData.clientSecret && planExists) {
          toast({
            title: 'Success',
            description: 'Your plan has been successfully updated!',
          })
          setClose()
          router.refresh()
        } else if (!subscriptionResponseData.clientSecret) {
          setError('Unable to process payment - subscription may already be active')
        }
        
      } catch (err) {
        console.error('Error creating subscription:', err)
        setError('Failed to create subscription. Please try again.')
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to create subscription. Please try again.',
        })
      } finally {
        setLoading(false)
      }
    }
    
    createSecret()
  }, [data, selectedPriceId, customerId, planExists, setClose, router])

  return (
    <div className="border-none transition-all">
      <div className="flex flex-col gap-4">
        {data.plans?.plans.map((price) => (
          <Card
            onClick={() => setSelectedPriceId(price.id as Plan)}
            key={price.id}
            className={clsx('relative cursor-pointer transition-all', {
              'border-primary': selectedPriceId === price.id,
            })}
          >
            <CardHeader>
              <CardTitle>
                ${price.unit_amount ? price.unit_amount / 100 : '0'}
                <p className="text-sm text-muted-foreground">
                  {price.nickname}
                </p>
                <p className="text-sm text-muted-foreground">
                  {
                    PRICING.find((p) => p.priceId === price.id)
                      ?.description
                  }
                </p>
              </CardTitle>
            </CardHeader>
            {selectedPriceId === price.id && (
              <div className="w-2 h-2 bg-emerald-500 rounded-full absolute top-4 right-4" />
            )}
          </Card>
        ))}

        {/* Affichage conditionnel pour les différents états */}
        {subscription.clientSecret && !planExists && (
          <>
            <h1 className="text-xl">Payment Method</h1>
            <Elements
              stripe={getStripe()}
              options={options}
            >
              <SubscriptionForm selectedPriceId={selectedPriceId} />
            </Elements>
          </>
        )}

        {loading && selectedPriceId && (
          <div className="flex items-center justify-center w-full h-40">
            <Loading />
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center w-full h-40">
            <div className="text-center text-destructive">
              <p className="text-sm">{error}</p>
              <button 
                onClick={() => {
                  setError(null)
                  setSelectedPriceId('')
                }}
                className="text-xs underline mt-2"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {!subscription.clientSecret && !loading && !error && selectedPriceId && planExists && (
          <div className="flex items-center justify-center w-full h-40">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">Plan updated successfully!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SubscriptionFormWrapper
