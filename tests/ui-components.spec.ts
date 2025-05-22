import { test, expect } from '@playwright/test';

test.describe('Composants UI', () => {
  test('doit afficher et interagir avec les cards de prix sur la page d\'accueil', async ({ page }) => {
    // Naviguer vers la page d'accueil
    await page.goto('/');
    
    // Trouver la section des prix
    const priceSection = await page.locator('section:has-text("Choose what fits you right")');
    await expect(priceSection).toBeVisible();
    
    // Vérifier la présence des cartes de prix
    const hoverPriceCard = await priceSection.locator('div:has-text("HoverPriceCard")').first();
    await expect(hoverPriceCard).toBeInViewport();
    
    // Simuler un hover sur une carte de prix (si l'interaction est disponible)
    const priceCards = await page.locator('div[role="button"]').all();
    if (priceCards.length > 0) {
      await priceCards[0].hover();
      // Attendre un effet visuel ou un changement d'état
      await page.waitForTimeout(500);
    }
  });

  test('doit afficher correctement les cartes défilantes', async ({ page }) => {
    // Naviguer vers la page d'accueil
    await page.goto('/');
    
    // Vérifier la présence des cartes défilantes
    const movingCards = await page.locator('section:has-text("InfiniteMovingCards")');
    await expect(movingCards).toBeVisible();
    
    // Vérifier que les cartes sont animées (vérification visuelle, difficile à automatiser)
    // Une option serait de prendre des captures d'écran et de les comparer à différents moments
    // Dans un test réel, on pourrait utiliser une bibliothèque de comparaison d'images
    // pour vérifier que les cartes ont bougé entre les deux captures
    // Ici, nous vérifions simplement que les captures ne sont pas identiques
    const screenshot1 = await movingCards.screenshot();
    await page.waitForTimeout(1000);
    const screenshot2 = await movingCards.screenshot();
    expect(Buffer.from(screenshot1).toString('base64')).not.toBe(Buffer.from(screenshot2).toString('base64'));
  });
}); 