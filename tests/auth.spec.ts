import { test, expect } from '@playwright/test';

test.describe('Authentification', () => {
  test('doit afficher correctement la page de connexion', async ({ page }) => {
    // Naviguer vers la page de connexion
    await page.goto('/agency/sign-in');
    
    // Vérifier que la page de connexion est affichée
    await expect(page).toHaveURL(/.*sign-in/);
    
    // Vérifier la présence de l'interface Clerk (comme nous utilisons @clerk/nextjs)
    // Note: Les tests réels doivent être adaptés à l'interface spécifique de Clerk dans votre application
    await expect(page.locator('div[data-clerk-component="SignIn"]')).toBeVisible({ timeout: 10000 });
  });

  test('doit afficher correctement la page d\'inscription', async ({ page }) => {
    // Naviguer vers la page d'inscription
    await page.goto('/agency/register');
    
    // Vérifier que la page d'inscription est affichée
    await expect(page).toHaveURL(/.*register/);
    
    // Vérifier la présence de l'interface Clerk
    await expect(page.locator('div[data-clerk-component="SignUp"]')).toBeVisible({ timeout: 10000 });
  });
}); 