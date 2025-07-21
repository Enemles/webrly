import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'uploadthing.com',
      'utfs.io',
      'img.clerk.com',
      'subdomain',
      'files.stripe.com',
    ],
  },
  reactStrictMode: false,
}

// Configuration Sentry
const sentryConfig = {
  // Désactiver le tunnel Sentry en développement
  tunnelRoute: process.env.NODE_ENV === 'production' ? '/monitoring/tunnel' : undefined,
  
  // Options de build
  silent: process.env.NODE_ENV === 'development',
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT || 'webrly',
  
  // Sourcemaps seulement en production
  widenClientFileUpload: process.env.NODE_ENV === 'production',
  hideSourceMaps: true,
  disableLogger: process.env.NODE_ENV === 'production',
};

// Exporter la configuration avec ou sans Sentry selon la disponibilité du DSN
export default process.env.SENTRY_DSN 
  ? withSentryConfig(nextConfig, sentryConfig)
  : nextConfig;