import { test, expect } from '@playwright/test';

test('Vérification de base du site', async ({ page }) => {
  // Visiter la page
  console.log('Navigation vers la page /site...');
  await page.goto('http://127.0.0.1:3000/site');
  
  // Attendre que la page soit chargée
  console.log('Attente du chargement complet de la page...');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000); // Attendre 2 secondes supplémentaires pour être sûr
  
  // Prendre une capture d'écran pour vérification visuelle
  console.log('Prise d\'une capture d\'écran...');
  await page.screenshot({ path: 'site.png' });
  
  // Vérifier simplement que la page a un contenu
  const bodyText = await page.textContent('body');
  console.log('Vérification du contenu de la page...');
  expect(bodyText?.length).toBeGreaterThan(0);
  
  console.log('Test terminé avec succès !');
}); 