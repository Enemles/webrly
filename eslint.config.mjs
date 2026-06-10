import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

// Next 16 a supprimé `next lint` ; on lint via l'ESLint CLI (`pnpm lint`).
// eslint-config-next 16 expose une flat-config native (ESLint 9) — on l'importe
// directement (pas de FlatCompat, qui casse sur la config react circulaire).
const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  ...nextCoreWebVitals,
  {
    // Règles "React Compiler" (react-hooks 7, nouvelles dans eslint-config-next 16) :
    // passées en `warn` pour ne pas bloquer le gate lint sur des patterns PRÉEXISTANTS
    // (setState dans un effet de montage, hoisting…) — ce ne sont pas des régressions
    // de la migration Next 16. À traiter dans un chantier React dédié.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
]

export default eslintConfig
