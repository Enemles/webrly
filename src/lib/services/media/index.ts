'use server'

import { db } from "@/lib/db"
import { CreateMediaType } from "@/lib/types"


export const getMedia = async (subaccountId: string) => {
  const mediaFile = await db.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
    include: {
      Media: true
    }
  })
  return mediaFile
}

export const createMedia = async (
  subaccountId: string,
  mediaFile: CreateMediaType
) => {
  const response = await db.media.create({
    data: {
      link: mediaFile.link,
      name: mediaFile.name,
      subAccountId: subaccountId,
    },
  })

  return response
}

export const deleteMedia = async (mediaId: string) => {
  const response = await db.media.delete({
    where: {
      id: mediaId,
    },
  })
  return response
}