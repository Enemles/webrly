import { test, expect } from '@playwright/test';

// Test nécessitant une authentification
test.describe('Tableau de bord de l\'agence', () => {
  // Nous utilisons une authentification simulée pour ce test
  // Dans un environnement réel, vous pourriez configurer l'authentification Clerk
  test.beforeEach(async ({ context }) => {
    // Simuler l'authentification en définissant un cookie ou localStorage
    // Ceci est un exemple et doit être adapté à votre mécanisme d'authentification réel
    await context.addCookies([
      {
        name: 'auth-session',
        value: 'mock-session-token',
        domain: 'localhost',
        path: '/',
      },
    ]);
  });

  test('doit accéder au tableau de bord après authentification', async ({ page }) => {
    // Naviguer vers la page du tableau de bord
    // Note: Ce test devra être adapté en fonction de votre système d'authentification réel
    await page.goto('/agency');
    
    // Vérifier que l'utilisateur est redirigé vers le tableau de bord
    // ou reste sur la page /agency si c'est déjà le tableau de bord
    await expect(page.url()).toMatch(/\/agency($|\/.*)/);
    
    // Vérifier la présence d'éléments qui confirment que nous sommes sur le tableau de bord
    // Ces sélecteurs devront être adaptés à votre interface réelle
    await expect(page.locator('h1:has-text("Agencies")').first()).toBeVisible({ timeout: 5000 });
  });
}); 