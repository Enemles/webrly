import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/tests/**', // Exclure les tests E2E de Playwright
      '**/tests-examples/**', // Exclure les exemples Playwright
      '**/test-results/**',
      '**/*.spec.ts' // Exclure les fichiers .spec.ts (Playwright)
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/lib/actions/**/*.ts',     // Server actions uniquement
        'src/lib/services/**/*.ts',    // Services métier uniquement
        'src/lib/utils.ts',            // Utilitaires
        'src/lib/constants.ts',        // Constantes
        'src/lib/metrics*.ts',         // Fonctions de métriques
        'src/lib/stripe/**/*.ts'       // Logique Stripe (métier)
      ],
      exclude: [
        // Fichiers de configuration et setup
        'coverage/**',
        'dist/**',
        '**/node_modules/**',
        'src/test/**',
        '**/*.d.ts',
        'next.config.js',
        'tailwind.config.ts',
        'postcss.config.js',
        'playwright.config.ts',
        'vitest.config.ts',
        
        // Fichiers Next.js et React (pas pour les tests unitaires)
        'src/app/**/*',               // Pages et layouts Next.js
        'src/components/**/*',        // Composants React
        'src/providers/**/*',         // Providers React
        'src/hooks/**/*',             // Hooks React
        'src/middleware.ts',          // Middleware Next.js
        
        // Types et configurations
        'src/lib/types/**/*',         // Définitions de types
        'src/lib/db.ts',              // Configuration DB (pas de logique)
        'src/lib/uploadthing.ts',     // Configuration externe
        'src/config/**/*',            // Fichiers de configuration
        
        // Tests eux-mêmes
        '**/__tests__/**',
        '**/*.test.ts',
        '**/*.spec.ts'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
}) 