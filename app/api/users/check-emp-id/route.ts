import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/server-auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: Request) {
	try {
		const authUser = await getAuthUser();

		if (!authUser) {
			return errorResponse("Unauthorized", 401);
		}

		const { searchParams } = new URL(request.url);
		const empId = searchParams.get('empId');

		if (!empId) {
			return errorResponse("Missing empId parameter", 400);
		}

		const existingProfile = await prisma.profile.findFirst({
			where: {
				empId,
				organizationId: authUser.organizationId,
			},
		});

		return successResponse({ exists: !!existingProfile });
	} catch (error: unknown) {
		console.error("[CHECK_EMP_ID_GET]", error);
		return errorResponse("Internal server error", 500);
	}
}
