import { test, expect } from '@playwright/test'

// La landing publique. IMPORTANT : le middleware multi-tenant ne sert le site
// marketing que sur l'hôte NEXT_PUBLIC_DOMAIN (localhost:3000) ; tout autre hôte
// (ex: 127.0.0.1) est traité comme un sous-domaine custom -> route funnel vide.
const SITE = 'http://localhost:3000/site'

test.describe('Landing page (refonte)', () => {
  test('rend en dark avec les sections clés', async ({ page }) => {
    await page.goto(SITE)
    await page.waitForLoadState('domcontentloaded')

    // Thème sombre forcé (classe .dark sur le sous-arbre du site)
    expect(await page.locator('.dark').count()).toBeGreaterThan(0)

    // Hero
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Run your agency')

    // Sections présentes (ancres réelles)
    await expect(page.locator('#features')).toBeAttached()
    await expect(page.locator('#pricing')).toBeAttached()
    await expect(page.locator('#faq')).toBeAttached()

    // Footer
    await expect(page.getByText('All rights reserved')).toBeVisible()
  })

  test('le toggle pricing mensuel/annuel change le prix', async ({ page }) => {
    await page.goto(SITE)
    await page.locator('#pricing').scrollIntoViewIfNeeded()

    // Mensuel : Basic à 49,99€
    await expect(page.getByText('49,99€')).toBeVisible()
    // Bascule annuel : -20% -> 39,99€
    await page.getByRole('button', { name: /Yearly/ }).click()
    await expect(page.getByText('39,99€')).toBeVisible()
  })

  test("la FAQ s'ouvre au clic", async ({ page }) => {
    await page.goto(SITE)
    const trigger = page.getByRole('button', { name: 'What is Webrly?' })
    await trigger.scrollIntoViewIfNeeded()
    await trigger.click()
    await expect(trigger).toHaveAttribute('data-state', 'open')
  })

  test('respecte prefers-reduced-motion (contenu visible, sans erreur JS)', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(SITE)
    await page.waitForLoadState('domcontentloaded')

    // En reduced-motion, le contenu est rendu directement (pas d'opacity:0).
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(errors).toEqual([])
  })
})
