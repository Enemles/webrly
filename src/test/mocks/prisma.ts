import { vi } from 'vitest'
import { PrismaClient } from '@prisma/client'

// Types d'aide pour les mocks
export type MockedPrismaClient = {
  [K in keyof PrismaClient]: PrismaClient[K] extends object
    ? {
        [P in keyof PrismaClient[K]]: PrismaClient[K][P] extends Function
          ? ReturnType<typeof vi.fn>
          : PrismaClient[K][P]
      }
    : PrismaClient[K]
}

// Mock complet de Prisma
export const mockPrisma: MockedPrismaClient = {
  // Mock des modèles principaux
  agency: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
    aggregate: vi.fn(),
  },
  subAccount: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
  },
  contact: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
  },
  pipeline: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
  },
  ticket: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
    aggregate: vi.fn(),
  },
  funnel: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
    aggregate: vi.fn(),
  },
  funnelPage: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
    aggregate: vi.fn(),
  },
  media: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
    aggregate: vi.fn(),
  },
  notification: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
    aggregate: vi.fn(),
  },
  lane: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
    aggregate: vi.fn(),
  },
  tag: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
    aggregate: vi.fn(),
  },
  subscription: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
  },
  permissions: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
  },
  // Méthodes de transaction
  $transaction: vi.fn(),
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  $executeRaw: vi.fn(),
  $queryRaw: vi.fn(),
} as any

// Helper pour créer des données de test
export const createMockAgency = (overrides: any = {}) => ({
  id: 'agency-1',
  name: 'Test Agency',
  agencyLogo: '/logo.png',
  companyEmail: 'test@agency.com',
  companyPhone: '+33123456789',
  whiteLabel: false,
  address: '123 Test St',
  city: 'Paris',
  zipCode: '75001',
  state: 'IDF',
  country: 'France',
  goal: 5,
  customerId: 'cus_test123',
  connectAccountId: 'acct_test123',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockPipeline = (overrides: any = {}) => ({
  id: 'pipeline-1',
  name: 'Test Pipeline',
  subAccountId: 'sub-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockUser = (overrides: any = {}) => ({
  id: 'user-1',
  name: 'Test User',
  email: 'test@user.com',
  avatarUrl: '/avatar.png',
  role: 'AGENCY_ADMIN',
  agencyId: 'agency-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockContact = (overrides: any = {}) => ({
  id: 'contact-1',
  name: 'Test Contact',
  email: 'test@contact.com',
  subAccountId: 'sub-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockFunnel = (overrides: any = {}) => ({
  id: 'funnel-1',
  name: 'Test Funnel',
  description: 'Test funnel description',
  published: false,
  subDomainName: 'test-funnel',
  favicon: '/favicon.ico',
  subAccountId: 'sub-1',
  liveProducts: '[]',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockFunnelPage = (overrides: any = {}) => ({
  id: 'page-1',
  name: 'Test Page',
  pathName: '/test-page',
  visits: 0,
  content: JSON.stringify([{
    content: [],
    id: '__body',
    name: 'Body',
    styles: { backgroundColor: 'white' },
    type: '__body',
  }]),
  order: 0,
  previewImage: '/preview.png',
  funnelId: 'funnel-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockMedia = (overrides: any = {}) => ({
  id: 'media-1',
  type: 'image/jpeg',
  name: 'test-image.jpg',
  link: 'https://example.com/test-image.jpg',
  subAccountId: 'sub-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockNotification = (overrides: any = {}) => ({
  id: 'notification-1',
  notification: 'Test Notification | Test action',
  agencyId: 'agency-1',
  subAccountId: 'sub-1',
  userId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockSubAccount = (overrides: any = {}) => ({
  id: 'sub-1',
  name: 'Test SubAccount',
  subAccountLogo: '/logo.png',
  companyEmail: 'test@subaccount.com',
  companyPhone: '+33123456789',
  address: '123 Test St',
  city: 'Paris',
  zipCode: '75001',
  state: 'IDF',
  country: 'France',
  goal: 3,
  agencyId: 'agency-1',
  customerId: 'cus_sub123',
  connectAccountId: 'acct_sub123',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockLane = (overrides: any = {}) => ({
  id: 'lane-1',
  name: 'Test Lane',
  order: 0,
  color: '#3B82F6',
  pipelineId: 'pipeline-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockTicket = (overrides: any = {}) => ({
  id: 'ticket-1',
  name: 'Test Ticket',
  order: 0,
  value: 1000,
  description: 'Test ticket description',
  laneId: 'lane-1',
  customerId: null,
  assignedUserId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockTag = (overrides: any = {}) => ({
  id: 'tag-1',
  name: 'Test Tag',
  color: '#10B981',
  subAccountId: 'sub-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

// Reset tous les mocks
export const resetPrismaMocks = () => {
  Object.values(mockPrisma).forEach((model: any) => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach((method: any) => {
        if (typeof method?.mockReset === 'function') {
          method.mockReset()
        }
      })
    }
  })
} 