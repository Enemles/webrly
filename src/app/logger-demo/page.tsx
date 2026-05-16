"use client"

import { useCallback } from "react"
import { logger } from "@/lib/utils"

export default function LoggerDemoPage() {
  const onDebug = useCallback(() => {
    logger.debug("debug message", { component: "logger-demo", action: "click", metadata: { step: 1 } })
  }, [])

  const onInfo = useCallback(() => {
    logger.info("info message", { component: "logger-demo", userId: "user-123", metadata: { feature: "demo" } })
  }, [])

  const onWarn = useCallback(() => {
    logger.warn("something to watch", { component: "logger-demo", metadata: { threshold: "near" } })
  }, [])

  const onError = useCallback(() => {
    logger.error("operation failed", { component: "logger-demo", error: new Error("Simulated error"), action: "save" })
  }, [])

  const onCritical = useCallback(() => {
    logger.critical("system failure", {
      component: "logger-demo",
      userId: "user-123",
      action: "payment-processing",
      metadata: { orderId: "ORD-456", amount: 100 }
    })
  }, [])

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Logger Demo</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Ouvre les DevTools du navigateur (Console) puis clique sur les boutons ci-dessous pour voir les logs
        colorés et groupés en mode développement.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button onClick={onDebug} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
          Log Debug
        </button>
        <button onClick={onInfo} className="px-4 py-2 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800">
          Log Info
        </button>
        <button onClick={onWarn} className="px-4 py-2 rounded bg-amber-100 hover:bg-amber-200 text-amber-900">
          Log Warn
        </button>
        <button onClick={onError} className="px-4 py-2 rounded bg-rose-100 hover:bg-rose-200 text-rose-900">
          Log Error
        </button>
        <button onClick={onCritical} className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white">
          Log Critical
        </button>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p>Astuce: en production, les logs sont sérialisés en JSON (non colorés) pour l&apos;agrégation.</p>
      </div>
    </main>
  )
}


