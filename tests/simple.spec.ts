import { test, expect } from '@playwright/test';

test('Test basique', async () => {
  // Un test très simple qui ne devrait jamais échouer
  expect(1 + 1).toBe(2);
  console.log('Test basique réussi !');
});

test('Vérifier l\'environnement Playwright', async ({ page }) => {
  // Vérifier que Playwright peut créer une page et faire des opérations basiques
  await page.setContent('<h1>Test</h1>');
  const heading = await page.textContent('h1');
  expect(heading).toBe('Test');
  console.log('Test de l\'environnement Playwright réussi !');
}); 