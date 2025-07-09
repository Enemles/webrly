import { vi } from 'vitest'

// Imports des mocks
import { mockPrisma, resetPrismaMocks } from './prisma'
import { setupNextMocks, resetNextMocks } from './next'
import { setupClerkMocks, resetClerkMocks } from './clerk'

// Mock de la base de données - doit être fait au niveau module
vi.mock('@/lib/db', () => ({
  db: mockPrisma,
}))

// Configuration de tous les mocks
export const setupAllMocks = () => {
  setupNextMocks()
  setupClerkMocks()
}

// Reset de tous les mocks
export const resetAllMocks = () => {
  resetPrismaMocks()
  resetNextMocks()
  resetClerkMocks()
}

// Re-exports pour faciliter l'usage
export * from './prisma'
export * from './next'
export * from './clerk'

// Mock des services externes (réservé pour autres services)
export const mockNotificationService = {
  saveActivityLogsNotification: vi.fn(),
}

// Mock spécifique du service notification pour les actions pipeline
vi.mock('@/lib/services/notification', () => ({
  saveActivityLogsNotification: mockNotificationService.saveActivityLogsNotification,
}))

// Mock console pour éviter les logs pendant les tests
export const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
}

// Setup global des mocks (appelé automatiquement)
setupAllMocks() 