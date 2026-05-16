'use server'

import { db } from "@/lib/db"
import { saveActivityLogsNotification } from "@/lib/services/notification"
import { clerkClient, currentUser } from '@clerk/nextjs'
import { redirect } from "next/navigation"
import { Role, User } from '@prisma/client'

export const getAuthUserDetails = async () => {
  const user = await currentUser()
  if (!user) {
    return
  }

  const userData = await db.user.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    include: {
      Agency: {
        include: {
          SidebarOption: true,
          SubAccount: {
            include: {
              SidebarOption: true,
            },
          },
        },
      },
      Permissions: true,
    },
  })

  return userData
}
export const getAuthUserGroup = async (agencyId: string) => {
  const teamMembers = await db.user.findMany({
    where: {
      Agency: {
        id: agencyId,
      },
    },
    include: {
      Agency: { include: { SubAccount: true } },
      Permissions: { include: { SubAccount: true } },
    },
  });

  return teamMembers;
};
export const verifyAndAcceptInvitation = async () => {
  const user = await currentUser()
  if (!user) return redirect('/sign-in')
  const invitationExists = await db.invitation.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
      status: 'PENDING',
    },
  })

  if (invitationExists) {
    const userDetails = await createTeamUser(invitationExists.agencyId, {
      email: invitationExists.email,
      agencyId: invitationExists.agencyId,
      avatarUrl: user.imageUrl,
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: invitationExists.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await saveActivityLogsNotification({
      agencyId: invitationExists?.agencyId,
      description: `Joined`,
      subaccountId: undefined,
    })

    if (userDetails) {
      await clerkClient.users.updateUserMetadata(user.id, {
        privateMetadata: {
          role: userDetails.role || 'SUBACCOUNT_USER',
        },
      })

      await db.invitation.delete({
        where: { email: userDetails.email },
      })

      return userDetails.agencyId
    } else return null
  } else {
    const agency = await db.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
    })
    return agency ? agency.agencyId : null
  }
}

export const createTeamUser = async (agencyId: string, user: User) => {
  if (user.role === 'AGENCY_OWNER') return null
  // TODO : add try catch around all my db calls
  const response = await db.user.create({ data: { ...user } })
  return response
}

export const initUser = async (newUser: Partial<User>) => {
  const user = await currentUser()
  if (!user) return null

  // Extraire le nom d'utilisateur de l'email si firstName/lastName sont vides
  const emailUsername = user.emailAddresses[0].emailAddress.split('@')[0]
  
  // Construire un nom d'utilisateur valide
  let userName = 'User'
  if (user.firstName || user.lastName) {
    userName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
  } else if (emailUsername) {
    userName = emailUsername
  }

  const userData = await db.user.upsert({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    update: newUser,
    create: {
      id: user.id,
      avatarUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
      name: userName,
      role: newUser.role || 'SUBACCOUNT_USER',
    }
  })
  await clerkClient.users.updateUserMetadata(user.id, {
    privateMetadata: {
      role: newUser.role || 'SUBACCOUNT_USER',
    },
  })
  return userData;
}

export const getUserPermissions = async (userId: string) => {
  const response = await db.user.findUnique({
    where: { id: userId },
    select: { Permissions: { include: { SubAccount: true } } },
  })

  return response
}

export const changeUserPermissions = async (
  permissionId: string | undefined,
  userEmail: string,
  subAccountId: string,
  permission: boolean
) => {
  console.log("DEBUG - Entrée dans changeUserPermissions avec:", {
    permissionId,
    userEmail,
    subAccountId,
    permission
  });

  try {
    // Vérifions d'abord si le permissionId existe réellement
    if (permissionId) {
      const existingPermission = await db.permissions.findUnique({
        where: { id: permissionId }
      });
      console.log("DEBUG - Permission existante pour cet ID:", existingPermission);
    }

    // Vérifions également s'il existe déjà une permission pour cet email et ce subAccountId
    const existingPermissionByEmail = await db.permissions.findFirst({
      where: {
        email: userEmail,
        subAccountId: subAccountId
      }
    });
    console.log("DEBUG - Permission existante pour cet email et subAccountId:", existingPermissionByEmail);

    let response;

    // Si nous avons un ID valide ou une correspondance par email/subAccountId
    if (permissionId || existingPermissionByEmail) {
      const idToUse = permissionId || existingPermissionByEmail?.id;
      console.log("DEBUG - Mise à jour de la permission avec ID:", idToUse);

      response = await db.permissions.update({
        where: { id: idToUse },
        data: { access: permission }
      });
    } else {
      // Sinon, créer une nouvelle permission
      console.log("DEBUG - Création d'une nouvelle permission");
      response = await db.permissions.create({
        data: {
          access: permission,
          email: userEmail,
          subAccountId: subAccountId
        }
      });
    }

    console.log("DEBUG - Réponse finale de l'opération:", response);
    return response;
  } catch (error) {
    console.error("DEBUG - Erreur dans changeUserPermissions:", error);
    throw error; // Propager l'erreur pour qu'elle soit capturée dans onChangePermission
  }
}

export const updateUser = async (user: Partial<User>) => {
  if (!user.email) {
    console.warn('updateUser: appelé sans email, abandon')
    return null
  }
  const { email, ...rest } = user
  if (Object.keys(rest).length === 0) {
    console.warn('updateUser: payload vide pour', email)
    return null
  }
  const response = await db.user.update({
    where: { email },
    data: rest,
  })

  await clerkClient.users.updateUserMetadata(response.id, {
    privateMetadata: {
      role: user.role || 'SUBACCOUNT_USER',
    },
  })

  return response
}

export const getUser = async (id: string) => {
  const user = await db.user.findUnique({
    where: {
      id,
    },
  })

  return user
}

export const deleteUser = async (userId: string) => {
  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      role: undefined,
    },
  })
  const deletedUser = await db.user.delete({ where: { id: userId } })

  return deletedUser
}

export const sendInvitation = async (
  role: Role,
  email: string,
  agencyId: string
) => {
  // Validation des paramètres
  if (!email || !agencyId || !role) {
    throw new Error('Email, agencyId et role sont requis');
  }

  // Validation du format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Format d\'email invalide');
  }

  const existingInvitation = await db.invitation.findUnique({
    where: { email }
  });

  if (existingInvitation) {
    return existingInvitation;
  }

  const response = await db.invitation.create({
    data: { email, agencyId, role },
  });

  try {
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: process.env.NEXT_PUBLIC_URL,
      publicMetadata: {
        throughInvitation: true,
        role,
      },
    });
  } catch (error) {
    // If Clerk invitation fails, delete the database record we just created
    await db.invitation.delete({ where: { id: response.id } });
    console.log(error);
    throw error;
  }

  return response;
}