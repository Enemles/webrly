import '@testing-library/jest-dom'
import { beforeEach, afterEach, vi } from 'vitest'
import { resetAllMocks } from './mocks'

// Mock global pour Next.js
global.fetch = vi.fn()

// Mock des variables d'environnement pour les tests
Object.assign(process.env, {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  CLERK_SECRET_KEY: 'test_secret_key',
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'test_publishable_key'
})

// Mock console pour éviter les logs pendant les tests
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeEach(() => {
  // Reset tous les mocks entre chaque test
  vi.clearAllMocks()
  resetAllMocks()
  
  // Mock console.error et console.warn pour éviter les logs inutiles
  console.error = vi.fn()
  console.warn = vi.fn()
})

// Restore console après les tests si nécessaire
afterEach(() => {
  // Optionnel : Restaurer console si besoin
  // console.error = originalConsoleError
  // console.warn = originalConsoleWarn
}) 