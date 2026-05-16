'use server'

import { db } from "@/lib/db"
import { logger } from "@/lib/utils"
import { Agency, Plan } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export const updateAgencyDetails = async (
  agencyId: string,
  agencyDetails: Partial<Agency>
) => {
  try {
    const response = await db.agency.update({
      where: { id: agencyId },
      data: { ...agencyDetails },
    })
    
    // Revalider le cache pour la page de l'agence et ses sous-pages
    revalidatePath(`/agency/${agencyId}`)
    revalidatePath(`/agency/${agencyId}/settings`)
    
    return response
  }
  catch (error) {
    console.error('Error updating agency details:', error)
    throw new Error('Failed to update agency details')
  }
}

export const getAgencyDetails = async (agencyId: string) => {
  try {
    const agencyDetails = await db.agency.findUnique({
      where: {
        id: agencyId,
      },
      include: {
        SubAccount: true,
      },
    });

    if (!agencyDetails) throw new Error("Agency not found");

    return agencyDetails;
  } catch (error) {
    logger.error('Failed to get agency details', {
      component: 'agency-service',
      action: 'get-agency-details',
      error: error as Error
    });
  }
};

export const deleteAgency = async (agencyId: string) => {
  try {
    const response = await db.agency.delete({ where: { id: agencyId } })
    return response
  } catch (error) {
    console.error('Error deleting agency:', error)
    throw new Error('Failed to delete agency')
  }
}

export const upsertAgency = async (agency: Agency, price?: Plan) => {
  console.log('[upsertAgency] payload reçu:', JSON.stringify({
    id: agency.id,
    name: agency.name,
    companyEmail: agency.companyEmail,
    agencyLogo: agency.agencyLogo?.slice(0, 60),
    customerId: agency.customerId,
    connectAccountId: agency.connectAccountId,
    keys: Object.keys(agency),
  }))
  if (!agency.companyEmail) {
    console.warn('[upsertAgency] companyEmail manquant, abandon')
    return null
  }
  if (!agency.id) {
    console.warn('[upsertAgency] id manquant, abandon')
    return null
  }
  const existing = await db.agency.findUnique({ where: { id: agency.id }, select: { id: true } })
  console.log('[upsertAgency] agence existante ?', !!existing)
  if (!existing && !agency.name) {
    console.warn('[upsertAgency] name manquant pour création, abandon')
    return null
  }
  try {
    const agencyDetails = await db.agency.upsert({
      where: {
        id: agency.id,
      },
      update: agency,
      create: {
        users: {
          connect: { email: agency.companyEmail },
        },
        ...agency,
        SidebarOption: {
          create: [
            {
              name: 'Dashboard',
              icon: 'category',
              link: `/agency/${agency.id}`,
            },
            {
              name: 'Launchpad',
              icon: 'clipboardIcon',
              link: `/agency/${agency.id}/launchpad`,
            },
            {
              name: 'Billing',
              icon: 'payment',
              link: `/agency/${agency.id}/billing`,
            },
            {
              name: 'Settings',
              icon: 'settings',
              link: `/agency/${agency.id}/settings`,
            },
            {
              name: 'Sub Accounts',
              icon: 'person',
              link: `/agency/${agency.id}/all-subaccounts`,
            },
            {
              name: 'Team',
              icon: 'shield',
              link: `/agency/${agency.id}/team`,
            },
          ],
        },
      },
    })
    return agencyDetails
  } catch (error) {
    console.error('[upsertAgency] Prisma error:', error)
    throw error
  }
}
