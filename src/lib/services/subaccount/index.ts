'use server'

import { db } from "@/lib/db"
import { SubAccount } from '@prisma/client'
import { v4 } from 'uuid'

export const upsertSubAccount = async (subAccount: SubAccount) => {
  console.log('[upsertSubAccount] payload reçu:', JSON.stringify({
    id: subAccount.id,
    name: subAccount.name,
    agencyId: subAccount.agencyId,
    companyEmail: subAccount.companyEmail,
    keys: Object.keys(subAccount),
  }))
  if (!subAccount.companyEmail) {
    console.warn('[upsertSubAccount] companyEmail manquant, abandon')
    return null
  }
  if (!subAccount.id) {
    console.warn('[upsertSubAccount] id manquant, abandon')
    return null
  }
  const existing = await db.subAccount.findUnique({ where: { id: subAccount.id }, select: { id: true } })
  console.log('[upsertSubAccount] sub-account existant ?', !!existing)
  if (!existing && !subAccount.name) {
    console.warn('[upsertSubAccount] name manquant pour création, abandon')
    return null
  }
  const agencyOwner = await db.user.findFirst({
    where: {
      Agency: {
        id: subAccount.agencyId,
      },
      role: 'AGENCY_OWNER',
    }
  })
  if (!agencyOwner) {
    console.warn('[upsertSubAccount] agency owner introuvable pour agencyId', subAccount.agencyId)
    return null
  }
  const permissionId = v4()
  try {
    const response = await db.subAccount.upsert({
      where: {
        id: subAccount.id,
      },
      update: subAccount,
      create: {
        ...subAccount,
      Permissions: {
        create: {
          access: true,
          email: agencyOwner.email,
          id: permissionId,
        },
        connect: {
          subAccountId: subAccount.id,
          id: permissionId,
        }
      },
      Pipeline: {
        create: { name: 'Lead Cycle' },
      },
      SidebarOption: {
        create: [
          {
            name: 'Dashboard',
            icon: 'category',
            link: `/subaccount/${subAccount.id}`,
          },
          {
            name: 'Launchpad',
            icon: 'clipboardIcon',
            link: `/subaccount/${subAccount.id}/launchpad`,
          },
          {
            name: 'Settings',
            icon: 'settings',
            link: `/subaccount/${subAccount.id}/settings`,
          },
          {
            name: 'Funnels',
            icon: 'pipelines',
            link: `/subaccount/${subAccount.id}/funnels`,
          },
          {
            name: 'Media',
            icon: 'database',
            link: `/subaccount/${subAccount.id}/media`,
          },
          {
            name: 'Pipelines',
            icon: 'flag',
            link: `/subaccount/${subAccount.id}/pipelines`,
          },
          {
            name: 'Contacts',
            icon: 'person',
            link: `/subaccount/${subAccount.id}/contacts`,
          }
        ],
      },
    }
  })
    return response
  } catch (error) {
    console.error('[upsertSubAccount] Prisma error:', error)
    throw error
  }
}

export const getSubaccountDetails = async (subaccountId: string) => {
  const response = await db.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
  })
  return response
}

export const deleteSubAccount = async (subaccountId: string) => {
  const response = await db.subAccount.delete({
    where: {
      id: subaccountId,
    },
  })
  return response
}

export const getSubAccountsTeamMembers = async (subaccountId: string) => {
  const subaccountUsersWithAccess = await db.user.findMany({
    where: {
      Agency: {
        SubAccount: {
          some: {
            id: subaccountId,
          },
        },
      },
      role: 'SUBACCOUNT_USER',
      Permissions: {
        some: {
          subAccountId: subaccountId,
          access: true,
        },
      },
    },
  })
  return subaccountUsersWithAccess
}
