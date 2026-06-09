'use server'

import { db } from "@/lib/db"
import { currentUser } from "@clerk/nextjs"

export const getNotificationAndUser = async (agencyId: string) => {
  try {
    const response = await db.notification.findMany({
      where: { agencyId },
      include: { User: true },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return response
  } catch (error) {
    console.log(error)
  }
}

export const saveActivityLogsNotification = async ({
  agencyId,
  description,
  subaccountId,
}: {
  agencyId?: string
  description: string
  subaccountId?: string
}) => {
  const authUser = await currentUser()
  let userData
  if (!authUser) {
    const response = await db.user.findFirst({
      where: {
        Agency: {
          SubAccount: {
            some: { id: subaccountId },
          },
        },
      },
    })
    if (response) {
      userData = response
    }
  } else {
    userData = await db.user.findUnique({
      where: { email: authUser?.emailAddresses[0].emailAddress },
    })
  }

  if (!userData) {
    console.log('Could not find a user')
    return
  }

  let foundAgencyId = agencyId
  if (!foundAgencyId) {
    if (!subaccountId) {
      console.warn('[saveActivityLogsNotification] ni agencyId ni subaccountId, skip')
      return
    }
    const response = await db.subAccount.findUnique({
      where: { id: subaccountId },
    })
    if (response) foundAgencyId = response.agencyId
  }
  if (!foundAgencyId) {
    console.warn('[saveActivityLogsNotification] agencyId introuvable pour subaccountId', subaccountId)
    return
  }
  if (subaccountId) {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: foundAgencyId,
          },
        },
        SubAccount: {
          connect: { id: subaccountId },
        },
      },
    })
  } else {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: foundAgencyId,
          },
        },
      },
    })
  }
}