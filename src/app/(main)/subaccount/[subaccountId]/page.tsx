import BlurPage from '@/components/global/blur-page'
import CircleProgress from '@/components/global/circle-progress'
import PipelineValue from '@/components/global/pipeline-value'
import SubaccountFunnelChart from '@/components/global/subaccount-funnel-chart'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getSubaccountAnalytics, getFunnelPerformanceMetrics } from '@/lib/services/analytics'
import { AreaChart } from '@tremor/react'
import { ClipboardIcon, Contact2, EuroIcon, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type Props = {
  params: { subaccountId: string }
  searchParams: {
    code: string
  }
}

const SubaccountPageId = async ({ params, searchParams }: Props) => {
  const currentYear = new Date().getFullYear()
  
  // Récupération des métriques via les services
  const analytics = await getSubaccountAnalytics(params.subaccountId)
  const funnelPerformanceMetrics = await getFunnelPerformanceMetrics(params.subaccountId)
  
  // Valeurs par défaut si pas de données Stripe
  const defaultValues = {
    currency: 'EUR',
    net: 0,
    potentialIncome: 0,
    closingRate: 0,
    sessions: [],
    totalClosedSessions: [],
    totalPendingSessions: [],
  }

  const {
    currency,
    net,
    potentialIncome,
    closingRate,
    sessions,
    totalClosedSessions,
    totalPendingSessions,
  } = analytics.stripe || defaultValues

  const hasStripeConnection = Boolean(analytics.stripe)

  return (
    <BlurPage>
      <div className="relative h-full">
        {!hasStripeConnection && (
          <div className="absolute -top-10 -left-10 right-0 bottom-0 z-30 flex items-center justify-center backdrop-blur-md bg-background/50">
            <Card>
              <CardHeader>
                <CardTitle>Connect Your Stripe</CardTitle>
                <CardDescription>
                  You need to connect your stripe account to see metrics
                </CardDescription>
                <Link
                  href={`/subaccount/${params.subaccountId}/launchpad`}
                  className="p-2 w-fit bg-secondary text-white rounded-md flex items-center gap-2"
                >
                  <ClipboardIcon />
                  Launch Pad
                </Link>
              </CardHeader>
            </Card>
          </div>
        )}
        <div className="flex flex-col gap-4 pb-6">
          <div className="flex gap-4 flex-col xl:!flex-row">
            <Card className="flex-1 relative">
              <CardHeader>
                <CardDescription>Income</CardDescription>
                <CardTitle className="text-4xl">
                  {net ? `${currency} ${net.toFixed(2)}` : `0€`}
                </CardTitle>
                <small className="text-xs text-muted-foreground">
                  For the year {currentYear}
                </small>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Total revenue generated as reflected in your stripe dashboard.
              </CardContent>
              <EuroIcon className="absolute right-4 top-4 text-muted-foreground" />
            </Card>
            <Card className="flex-1 relative">
              <CardHeader>
                <CardDescription>Potential Income</CardDescription>
                <CardTitle className="text-4xl">
                  {potentialIncome
                    ? `${currency} ${potentialIncome.toFixed(2)}`
                    : `0€`}
                </CardTitle>
                <small className="text-xs text-muted-foreground">
                  For the year {currentYear}
                </small>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                This is how much you can close.
              </CardContent>
              <Contact2 className="absolute right-4 top-4 text-muted-foreground" />
            </Card>
            <PipelineValue subaccountId={params.subaccountId} />

            <Card className="xl:w-fit">
              <CardHeader>
                <CardDescription>Conversions</CardDescription>
                <CircleProgress
                  value={closingRate}
                  description={
                    <>
                      {sessions.length > 0 && (
                        <div className="flex flex-col">
                          Total Carts Opened
                          <div className="flex gap-2">
                            <ShoppingCart className="text-rose-700" />
                            {sessions.length}
                          </div>
                        </div>
                      )}
                      {totalClosedSessions.length > 0 && (
                        <div className="flex flex-col">
                          Won Carts
                          <div className="flex gap-2">
                            <ShoppingCart className="text-emerald-700" />
                            {totalClosedSessions.length}
                          </div>
                        </div>
                      )}
                    </>
                  }
                />
              </CardHeader>
            </Card>
          </div>

          <div className="flex gap-4 flex-col xl:!flex-row">
            <Card className="relative">
              <CardHeader>
                <CardDescription>Funnel Performance</CardDescription>
              </CardHeader>
              <CardContent className=" text-sm text-muted-foreground flex flex-col gap-12 justify-between ">
                <SubaccountFunnelChart data={funnelPerformanceMetrics} />
                <div className="lg:w-[150px]">
                  Total page visits across all funnels. Hover over to get more
                  details on funnel page performance.
                </div>
              </CardContent>
              <Contact2 className="absolute right-4 top-4 text-muted-foreground" />
            </Card>
            <Card className="p-4 flex-1">
              <CardHeader>
                <CardTitle>Checkout Activity</CardTitle>
              </CardHeader>
              <AreaChart
                className="text-sm stroke-primary"
                data={sessions}
                index="created"
                categories={['amount_total']}
                colors={['primary']}
                yAxisWidth={30}
                showAnimation={true}
              />
            </Card>
          </div>
          <div className="flex gap-4 flex-col xl:!flex-row">
            <Card className="p-4 flex-1 relative">
              <CardHeader>
                <CardDescription>Transaction History</CardDescription>
                <Table>
                  <TableHeader className="!sticky !top-0">
                    <TableRow>
                      <TableHead className="w-[200px]">Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="font-medium truncate">
                    {totalClosedSessions.length > 0
                      ? totalClosedSessions.map((session) => (
                          <TableRow key={session.id}>
                            <TableCell>
                              {session.customer_details?.email || '-'}
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-emerald-500 dark:text-black">
                                Paid
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {session.created}
                            </TableCell>
                            <TableCell className="text-right">
                              <small>{currency}</small>{' '}
                              <span className="text-emerald-500">
                                {session.amount_total}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      : <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No Data
                          </TableCell>
                        </TableRow>}
                  </TableBody>
                </Table>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </BlurPage>
  )
}

export default SubaccountPageId
