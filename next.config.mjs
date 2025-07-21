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

// TEMPORAIREMENT - Sentry désactivé pour fix des 502/504
// Configuration Sentry simple à réactiver plus tard
export default nextConfig;

/*
// Configuration Sentry complète à réactiver
import { withSentryConfig } from "@sentry/nextjs";

const sentryConfig = {
  tunnelRoute: process.env.NODE_ENV === 'production' ? '/monitoring/tunnel' : undefined,
  silent: process.env.NODE_ENV === 'development',
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT || 'webrly',
  widenClientFileUpload: process.env.NODE_ENV === 'production',
  hideSourceMaps: true,
  disableLogger: process.env.NODE_ENV === 'production',
};

export default process.env.SENTRY_DSN 
  ? withSentryConfig(nextConfig, sentryConfig)
  : nextConfig;
*/