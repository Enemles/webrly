import { test, expect } from '@playwright/test';

test.describe('Page d\'accueil', () => {
  test('doit charger correctement la page d\'accueil', async ({ page }) => {
    // Naviguer vers la page d'accueil
    await page.goto('/');
    
    // Attendre que la page soit chargée
    await page.waitForLoadState('networkidle');
    
    // Vérifier que nous sommes sur une page qui existe
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
    
    // Capture d'écran pour vérifier visuellement
    await page.screenshot({ path: 'homepage.png' });
    
    console.log('Test de la page d\'accueil terminé');
  });
}); 