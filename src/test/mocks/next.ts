import { vi } from 'vitest'

// Mock pour revalidatePath
export const mockRevalidatePath = vi.fn()

// Mock pour redirect
export const mockRedirect = vi.fn()

// Mock pour notFound
export const mockNotFound = vi.fn()

// Mock pour revalidateTag
export const mockRevalidateTag = vi.fn()

// Mock pour unstable_cache
export const mockUnstableCache = vi.fn()

// Configuration des mocks Next.js
export const setupNextMocks = () => {
  // Mock next/cache
  vi.mock('next/cache', () => ({
    revalidatePath: mockRevalidatePath,
    revalidateTag: mockRevalidateTag,
    unstable_cache: mockUnstableCache,
  }))

  // Mock next/navigation
  vi.mock('next/navigation', () => ({
    redirect: mockRedirect,
    notFound: mockNotFound,
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    })),
    usePathname: vi.fn(() => '/test-path'),
    useSearchParams: vi.fn(() => new URLSearchParams()),
  }))
}

// Reset tous les mocks Next.js
export const resetNextMocks = () => {
  mockRevalidatePath.mockReset()
  mockRedirect.mockReset()
  mockNotFound.mockReset()
  mockRevalidateTag.mockReset()
  mockUnstableCache.mockReset()
} 