import { vi } from 'vitest'

// Mock pour currentUser de Clerk
export const mockCurrentUser = vi.fn()

// Mock pour clerkClient
export const mockClerkClient = {
  users: {
    updateUserMetadata: vi.fn(),
    getUser: vi.fn(),
    deleteUser: vi.fn(),
    banUser: vi.fn(),
    unbanUser: vi.fn(),
  },
  sessions: {
    getSessionList: vi.fn(),
  },
}

// Mock user data pour les tests
export const createMockClerkUser = (overrides: any = {}) => ({
  id: 'user_test123',
  firstName: 'Test',
  lastName: 'User',
  imageUrl: 'https://example.com/avatar.png',
  emailAddresses: [
    {
      emailAddress: 'test@example.com',
      id: 'email_test123',
    },
  ],
  primaryEmailAddressId: 'email_test123',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
})

// Configuration des mocks Clerk
export const setupClerkMocks = () => {
  // Mock @clerk/nextjs
  vi.mock('@clerk/nextjs', () => ({
    currentUser: mockCurrentUser,
    clerkClient: mockClerkClient,
    auth: vi.fn(() => ({
      userId: 'user_test123',
      sessionId: 'sess_test123',
      orgId: null,
    })),
    AuthenticateWithRedirectCallback: vi.fn(),
    ClerkProvider: vi.fn(({ children }) => children),
    SignIn: vi.fn(() => 'SignIn Component'),
    SignUp: vi.fn(() => 'SignUp Component'),
    UserButton: vi.fn(() => 'UserButton Component'),
  }))

  // Mock @clerk/nextjs/server
  vi.mock('@clerk/nextjs/server', () => ({
    currentUser: mockCurrentUser,
    clerkClient: mockClerkClient,
    auth: vi.fn(() => ({
      userId: 'user_test123',
      sessionId: 'sess_test123',
      orgId: null,
    })),
  }))
}

// Reset tous les mocks Clerk
export const resetClerkMocks = () => {
  mockCurrentUser.mockReset()
  mockClerkClient.users.updateUserMetadata.mockReset()
  mockClerkClient.users.getUser.mockReset()
  mockClerkClient.users.deleteUser.mockReset()
  mockClerkClient.users.banUser.mockReset()
  mockClerkClient.users.unbanUser.mockReset()
  mockClerkClient.sessions.getSessionList.mockReset()
}

// Helper pour simuler un utilisateur connecté
export const mockLoggedInUser = (userData?: any) => {
  const user = createMockClerkUser(userData)
  mockCurrentUser.mockResolvedValue(user)
  return user
}

// Helper pour simuler aucun utilisateur connecté
export const mockNoUser = () => {
  mockCurrentUser.mockResolvedValue(null)
} 