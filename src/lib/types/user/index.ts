import { Prisma, Role } from '@prisma/client'
import { getAuthUserDetails, getUserPermissions } from '@/lib/services/auth'

export type AuthUserWithAgencySigebarOptionsSubAccounts =
  Prisma.PromiseReturnType<typeof getAuthUserDetails>

export type UserWithPermissionsAndSubAccounts = Prisma.PromiseReturnType<
  typeof getUserPermissions
>

// Type basé sur la structure de données pour éviter les problèmes de sérialisation
export type UsersWithAgencySubAccountPermissionsSidebarOptions = {
  id: string
  name: string
  avatarUrl: string
  email: string
  createdAt: Date
  updatedAt: Date
  role: Role
  agencyId: string | null
  Agency: {
    id: string
    name: string
    agencyLogo: string
    companyEmail: string
    companyPhone: string
    whiteLabel: boolean
    address: string
    city: string
    zipCode: string
    state: string
    country: string
    goal: number
    customerId: string
    createdAt: Date
    updatedAt: Date
    connectAccountId: string | null
    SubAccount: Array<{
      id: string
      connectAccountId: string | null
      name: string
      subAccountLogo: string
      createdAt: Date
      updatedAt: Date
      companyEmail: string
      companyPhone: string
      goal: number
      address: string
      city: string
      zipCode: string
      state: string
      country: string
      agencyId: string
    }>
  } | null
  Permissions: Array<{
    id: string
    email: string
    subAccountId: string
    access: boolean
    SubAccount: {
      id: string
      connectAccountId: string | null
      name: string
      subAccountLogo: string
      createdAt: Date
      updatedAt: Date
      companyEmail: string
      companyPhone: string
      goal: number
      address: string
      city: string
      zipCode: string
      state: string
      country: string
      agencyId: string
    }
  }>
} | null 