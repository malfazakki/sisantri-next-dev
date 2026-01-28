// Removed NextResponse import as it is unused
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/server-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const authUser = await getAuthUser();
    
    if (!authUser) {
      return errorResponse('Unauthorized', 401);
    }

    const users = await prisma.user.findMany({
      where: {
        organizationId: authUser.organizationId,
        deletedAt: null,
      },
      include: {
        profile: {
          include: {
            division: true,
            department: true,
          },
        },
        roles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(users);
  } catch (error) {
    console.error('[USERS_GET]', error);
    return errorResponse('Internal server error', 500);
  }
}
