import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/server-auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
	try {
		const authUser = await getAuthUser();
		if (!authUser) {
			return errorResponse("Unauthorized", 401);
		}

		const user = await prisma.user.findUnique({
			where: { id: authUser.userId },
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
				organization: true,
			},
		});

		if (!user) {
			return errorResponse("User not found", 404);
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password: _, ...userWithoutPassword } = user;
		
		// Add name field for frontend compatibility
		if (user.profile) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(userWithoutPassword as any).name = user.profile.fullName;
		}

		return successResponse(userWithoutPassword);
	} catch (error) {
		console.error("[PROFILE_GET]", error);
		return errorResponse("Internal server error", 500);
	}
}

export async function PATCH(request: Request) {
	try {
		const authUser = await getAuthUser();
		if (!authUser) {
			return errorResponse("Unauthorized", 401);
		}

		const body = await request.json();
		const { fullName, avatar } = body;

		const updatedUser = await prisma.user.update({
			where: { id: authUser.userId },
			data: {
				profile: {
					update: {
						fullName: fullName !== undefined ? fullName : undefined,
						avatar: avatar !== undefined ? avatar : undefined,
					},
				},
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
				organization: true,
			},
		});

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password: _, ...userWithoutPassword } = updatedUser;

		// Add name field for frontend compatibility
		if (updatedUser.profile) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(userWithoutPassword as any).name = updatedUser.profile.fullName;
		}

		return successResponse(userWithoutPassword, "Profile updated successfully");
	} catch (error) {
		console.error("[PROFILE_PATCH]", error);
		return errorResponse("Internal server error", 500);
	}
}
