// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://955d497b15f9880407546c9a9d3f450c@o4509706654646272.ingest.de.sentry.io/4509706658578512',

  integrations: [Sentry.replayIntegration()],

  tracesSampleRate: 1,

  enableLogs: true,

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  debug: false,
})
