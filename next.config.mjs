import {withSentryConfig} from '@sentry/nextjs';
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build autonome (.next/standalone/server.js) pour l'image Docker : seules les
  // dépendances tracées sont copiées, plus besoin de node_modules complet au runtime.
  output: 'standalone',
  // Racine de tracing ancrée sur le projet : un lockfile parasite dans un dossier
  // parent ferait inférer une autre racine et décalerait server.js dans standalone/.
  outputFileTracingRoot: import.meta.dirname,
  images: {
    // Pas de dangerouslyAllowSVG : toutes les URLs SVG stockées finissent par
    // `.svg` (clés UploadThing `<uuid>-<id>.svg`, logos locaux), et next/image les
    // sert alors telles quelles (unoptimized auto) sans passer par l'optimiseur.
    remotePatterns: [
      // Uploads UploadThing v6 (logos, médias) : https://utfs.io/f/<key>
      { protocol: 'https', hostname: 'utfs.io', pathname: '/f/**' },
      // Anciennes URLs UploadThing (301 vers utfs.io)
      { protocol: 'https', hostname: 'uploadthing.com', pathname: '/f/**' },
      // Avatars Clerk (PNG/JPEG/AVIF)
      { protocol: 'https', hostname: 'img.clerk.com' },
      // Images produits Stripe
      { protocol: 'https', hostname: 'files.stripe.com' },
      // Données de démo (prisma/seed.ts) : médias placehold.co, anciens logos ui-avatars
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'ui-avatars.com', pathname: '/api/**' },
    ],
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  reactStrictMode: false,
}

export default withSentryConfig(nextConfig, {
// For all available options, see:
// https://www.npmjs.com/package/@sentry/webpack-plugin#options

org: "webrly",
project: "webrly",

// Only print logs for uploading source maps in CI
silent: !process.env.CI,

// For all available options, see:
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

// Upload a larger set of source maps for prettier stack traces (increases build time)
widenClientFileUpload: true,

// Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
// This can increase your server load as well as your hosting bill.
// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
// side errors will fail.
// tunnelRoute: "/monitoring",

// Automatically tree-shake Sentry logger statements to reduce bundle size
disableLogger: true,

// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
// See the following for more information:
// https://docs.sentry.io/product/crons/
// https://vercel.com/docs/cron-jobs
automaticVercelMonitors: true,
});