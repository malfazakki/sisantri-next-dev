import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/server-auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
	try {
		const authUser = await getAuthUser();
		if (!authUser) {
			return errorResponse("Unauthorized", 401);
		}

		const activities = await prisma.activity.findMany({
			where: {
				organizationId: authUser.organizationId,
				deletedAt: null,
			},
			include: {
				_count: {
					select: {
						activityRegistrations: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return successResponse(activities);
	} catch (error) {
		console.error("[ACTIVITIES_GET]", error);
		return errorResponse("Internal server error", 500);
	}
}

export async function POST(request: Request) {
	try {
		const authUser = await getAuthUser();
		if (!authUser) {
			return errorResponse("Unauthorized", 401);
		}

		const body = await request.json();
		const { name } = body;

		if (!name) {
			return errorResponse("Name is required", 400);
		}

		const activity = await prisma.activity.create({
			data: {
				name,
				organizationId: authUser.organizationId,
			},
		});

		return successResponse(activity, "Activity created successfully", 201);
	} catch (error) {
		console.error("[ACTIVITIES_POST]", error);
		return errorResponse("Internal server error", 500);
	}
}
