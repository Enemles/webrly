'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'

import MaxWidthWrapper from '@/components/ui/max-width-wrapper'
import { STATS } from '@/config/stats'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

function Counter({ value, suffix }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -20% 0px' })
  const reduce = useReducedMotion()
  const [current, setCurrent] = useState(reduce ? value : 0)

  useEffect(() => {
    if (reduce) {
      setCurrent(value)
      return
    }
    if (!inView) return
    let raf = 0
    const start = performance.now()
    const duration = 1500
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setCurrent(value * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, reduce])

  const display = Number.isInteger(value)
    ? Math.round(current).toLocaleString('en-US')
    : current.toFixed(1)

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  )
}

export function StatsBand() {
  return (
    <section className="border-y border-border py-16 md:py-20">
      <MaxWidthWrapper>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-gradient-green text-4xl font-bold tracking-tight md:text-5xl">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  )
}
