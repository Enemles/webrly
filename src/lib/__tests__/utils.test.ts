import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { cn, convertDecimalToNumber, logger, getStripeOAuthLink } from '../utils'

describe('Utils', () => {
  beforeEach(() => {
    // Reset console mocks
    vi.clearAllMocks()
  })

  describe('cn - fonction de fusion de classes CSS', () => {
    it('devrait fusionner les classes Tailwind correctement', () => {
      // Act
      const result = cn('px-2 py-1', 'px-4 text-red-500')

      // Assert
      expect(result).toBe('py-1 px-4 text-red-500')
    })

    it('devrait gérer les classes conditionnelles', () => {
      // Act
      const result = cn('base-class', false && 'conditional-class', 'active-class')

      // Assert
      expect(result).toBe('base-class active-class')
    })

    it('devrait gérer les objets de classes', () => {
      // Act
      const result = cn('base', {
        'active': true,
        'disabled': false
      })

      // Assert
      expect(result).toBe('base active')
    })

    it('devrait gérer les tableaux de classes', () => {
      // Act
      const result = cn(['class1', 'class2'], 'class3')

      // Assert
      expect(result).toBe('class1 class2 class3')
    })

    it('devrait gérer les valeurs null et undefined', () => {
      // Act
      const result = cn('base', null, undefined, 'end')

      // Assert
      expect(result).toBe('base end')
    })
  })

  describe('convertDecimalToNumber - conversion des Decimal Prisma', () => {
    it('devrait convertir un objet Decimal en nombre', () => {
      // Arrange
      const mockDecimal = {
        toNumber: vi.fn().mockReturnValue(42.5)
      }

      // Act
      const result = convertDecimalToNumber(mockDecimal)

      // Assert
      expect(mockDecimal.toNumber).toHaveBeenCalled()
      expect(result).toBe(42.5)
    })

    it('devrait gérer les valeurs null et undefined', () => {
      // Act & Assert
      expect(convertDecimalToNumber(null)).toBeNull()
      expect(convertDecimalToNumber(undefined)).toBeUndefined()
    })

    it('devrait préserver les dates', () => {
      // Arrange
      const date = new Date('2024-01-01')

      // Act
      const result = convertDecimalToNumber(date)

      // Assert
      expect(result).toBe(date)
      expect(result instanceof Date).toBe(true)
    })

    it('devrait convertir les tableaux récursivement', () => {
      // Arrange
      const mockDecimal1 = { toNumber: vi.fn().mockReturnValue(10) }
      const mockDecimal2 = { toNumber: vi.fn().mockReturnValue(20) }
      const array = [mockDecimal1, 'string', mockDecimal2, 42]

      // Act
      const result = convertDecimalToNumber(array)

      // Assert
      expect(result).toEqual([10, 'string', 20, 42])
      expect(mockDecimal1.toNumber).toHaveBeenCalled()
      expect(mockDecimal2.toNumber).toHaveBeenCalled()
    })

    it('devrait convertir les objets récursivement', () => {
      // Arrange
      const mockDecimal = { toNumber: vi.fn().mockReturnValue(100) }
      const obj = {
        id: 'test-id',
        value: mockDecimal,
        name: 'Test Object',
        nested: {
          price: { toNumber: vi.fn().mockReturnValue(50) }
        }
      }

      // Act
      const result = convertDecimalToNumber(obj)

      // Assert
      expect(result).toEqual({
        id: 'test-id',
        value: 100,
        name: 'Test Object',
        nested: {
          price: 50
        }
      })
      expect(mockDecimal.toNumber).toHaveBeenCalled()
      expect(obj.nested.price.toNumber).toHaveBeenCalled()
    })

    it('devrait préserver les types primitifs', () => {
      // Act & Assert
      expect(convertDecimalToNumber('string')).toBe('string')
      expect(convertDecimalToNumber(42)).toBe(42)
      expect(convertDecimalToNumber(true)).toBe(true)
      expect(convertDecimalToNumber(false)).toBe(false)
    })

    it('devrait gérer les objets complexes avec Decimal imbriqués', () => {
      // Arrange
      const complexObject = {
        user: {
          tickets: [
            {
              id: '1',
              value: { toNumber: vi.fn().mockReturnValue(150.75) },
              date: new Date('2024-01-01')
            },
            {
              id: '2', 
              value: { toNumber: vi.fn().mockReturnValue(250.25) },
              tags: ['urgent', 'high-priority']
            }
          ]
        }
      }

      // Act
      const result = convertDecimalToNumber(complexObject)

      // Assert
      expect(result.user.tickets[0].value).toBe(150.75)
      expect(result.user.tickets[1].value).toBe(250.25)
      expect(result.user.tickets[0].date instanceof Date).toBe(true)
      expect(result.user.tickets[1].tags).toEqual(['urgent', 'high-priority'])
    })
  })

  describe('logger - système de logging structuré', () => {
    it('devrait logger en mode development avec grouping', () => {
      // Arrange
      const consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {})
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {})
      vi.stubEnv('NODE_ENV', 'development')

      // Act
      logger.info('test message', { component: 'test', metadata: { data: 'test' } })

      // Assert
      expect(consoleGroupSpy).toHaveBeenCalledWith(
        '%c[INFO] test message', 
        'color: #059669; background: #d1fae5'
      )
      expect(consoleLogSpy).toHaveBeenCalledWith('🧩 Component:', 'test')
      expect(consoleLogSpy).toHaveBeenCalledWith('📊 Metadata:', { data: 'test' })
      expect(consoleGroupEndSpy).toHaveBeenCalled()

      consoleGroupSpy.mockRestore()
      consoleLogSpy.mockRestore()
      consoleGroupEndSpy.mockRestore()
      vi.unstubAllEnvs()
    })

    it('devrait logger en JSON en mode production', () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      vi.stubEnv('NODE_ENV', 'production')

      // Act
      logger.warn('test message', { component: 'test' })

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/"level":"warn".*"message":"test message"/)
      )

      consoleSpy.mockRestore()
      vi.unstubAllEnvs()
    })

    it('devrait logger différents niveaux correctement', () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      vi.stubEnv('NODE_ENV', 'production')

      // Act
      logger.debug('debug message')
      logger.info('info message')
      logger.error('error message', { error: new Error('test error') })

      // Assert
      expect(consoleSpy).toHaveBeenCalledTimes(3)

      consoleSpy.mockRestore()
      vi.unstubAllEnvs()
    })

    it('devrait gérer le contexte métier complet', () => {
      // Arrange
      const consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {})
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      vi.stubEnv('NODE_ENV', 'development')

      // Act
      logger.critical('system failure', {
        component: 'database',
        userId: 'user-123',
        action: 'payment-processing',
        metadata: { orderId: '456', amount: 100 }
      })

      // Assert
      expect(consoleGroupSpy).toHaveBeenCalledWith(
        '%c[CRITICAL] system failure',
        'color: #ffffff; background: #dc2626; font-weight: bold'
      )
      expect(consoleLogSpy).toHaveBeenCalledWith('🧩 Component:', 'database')
      expect(consoleLogSpy).toHaveBeenCalledWith('👤 User:', 'user-123')
      expect(consoleLogSpy).toHaveBeenCalledWith('🎯 Action:', 'payment-processing')

      consoleGroupSpy.mockRestore()
      consoleLogSpy.mockRestore()
      vi.unstubAllEnvs()
    })
  })

  describe('getStripeOAuthLink - génération de liens OAuth Stripe', () => {
    beforeEach(() => {
      // Stub des variables d'environnement pour tous les tests Stripe
      vi.stubEnv('NEXT_PUBLIC_STRIPE_CLIENT_ID', 'ca_test_123456')
      vi.stubEnv('NEXT_PUBLIC_URL', 'https://localhost:3000')
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('devrait générer un lien OAuth pour une agence', () => {
      // Arrange
      const state = 'agency-123'

      // Act
      const result = getStripeOAuthLink('agency', state)

      // Assert
      expect(result).toBe(
        'https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_test_123456&scope=read_write&redirect_uri=https://localhost:3000/agency&state=agency-123'
      )
    })

    it('devrait générer un lien OAuth pour un subaccount', () => {
      // Arrange
      const state = 'sub-456'

      // Act
      const result = getStripeOAuthLink('subaccount', state)

      // Assert
      expect(result).toBe(
        'https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_test_123456&scope=read_write&redirect_uri=https://localhost:3000/subaccount&state=sub-456'
      )
    })

    it('devrait encoder correctement les paramètres d\'état complexes', () => {
      // Arrange
      const complexState = 'agency-123&redirect=/dashboard'

      // Act
      const result = getStripeOAuthLink('agency', complexState)

      // Assert
      expect(result).toContain('state=agency-123&redirect=/dashboard')
    })

    it('devrait gérer les états vides', () => {
      // Act
      const result = getStripeOAuthLink('subaccount', '')

      // Assert
      expect(result).toContain('state=')
      expect(result).toContain('redirect_uri=https://localhost:3000/subaccount')
    })

    it('devrait utiliser les variables d\'environnement correctes', () => {
      // Act
      const result = getStripeOAuthLink('agency', 'test-state')

      // Assert
      expect(result).toContain('client_id=ca_test_123456')
      expect(result).toContain('redirect_uri=https://localhost:3000')
      expect(result).toContain('response_type=code')
      expect(result).toContain('scope=read_write')
    })
  })
}) 