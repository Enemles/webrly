import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// clerkMiddleware (Clerk v6) attache le contexte d'auth pour que auth()/currentUser()
// fonctionnent côté serveur. On reproduit À L'IDENTIQUE le comportement de l'ancien
// authMiddleware de ce projet : aucune protection au niveau middleware (elle est gérée
// page par page via currentUser()), uniquement les réécritures multi-tenant ci-dessous.
export default clerkMiddleware(async (auth, req) => {
  //rewrite for domains
  const url = req.nextUrl
  const searchParams = url.searchParams.toString()
  let hostname = req.headers

  const pathWithSearchParams = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ''
  }`

  //if subdomain exists
  const customSubDomain = hostname
    .get('host')
    ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
    .filter(Boolean)[0]

  if (customSubDomain) {
    return NextResponse.rewrite(
      new URL(`/${customSubDomain}${pathWithSearchParams}`, req.url)
    )
  }

  if (url.pathname === '/sign-in' || url.pathname === '/sign-up') {
    return NextResponse.redirect(new URL(`/agency/sign-in`, req.url))
  }

  if (
    url.pathname === '/' ||
    (url.pathname === '/site' && url.host === process.env.NEXT_PUBLIC_DOMAIN)
  ) {
    return NextResponse.rewrite(new URL('/site', req.url))
  }

  if (
    url.pathname.startsWith('/agency') ||
    url.pathname.startsWith('/subaccount')
  ) {
    return NextResponse.rewrite(new URL(`${pathWithSearchParams}`, req.url))
  }
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
