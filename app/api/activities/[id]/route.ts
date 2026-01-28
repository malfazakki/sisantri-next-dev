import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/server-auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const authUser = await getAuthUser();
		if (!authUser) {
			return errorResponse("Unauthorized", 401);
		}

		const { id } = await params;
		const activityId = parseInt(id);

		if (isNaN(activityId)) {
			return errorResponse("Invalid ID", 400);
		}

		const activity = await prisma.activity.findFirst({
			where: {
				id: activityId,
				organizationId: authUser.organizationId,
				deletedAt: null,
			},
		});

		if (!activity) {
			return errorResponse("Activity not found", 404);
		}

		return successResponse(activity);
	} catch (error) {
		console.error("[ACTIVITY_GET]", error);
		return errorResponse("Internal server error", 500);
	}
}

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const authUser = await getAuthUser();
		if (!authUser) {
			return errorResponse("Unauthorized", 401);
		}

		const { id } = await params;
		const activityId = parseInt(id);
		const body = await request.json();
		const { name } = body;

		if (isNaN(activityId)) {
			return errorResponse("Invalid ID", 400);
		}

		if (!name) {
			return errorResponse("Name is required", 400);
		}

		const result = await prisma.activity.updateMany({
			where: {
				id: activityId,
				organizationId: authUser.organizationId,
				deletedAt: null,
			},
			data: {
				name,
			},
		});

		if (result.count === 0) {
			return errorResponse("Activity not found", 404);
		}

		const updatedActivity = await prisma.activity.findUnique({
			where: { id: activityId },
		});

		return successResponse(updatedActivity, "Activity updated successfully");
	} catch (error) {
		console.error("[ACTIVITY_PATCH]", error);
		return errorResponse("Internal server error", 500);
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const authUser = await getAuthUser();
		if (!authUser) {
			return errorResponse("Unauthorized", 401);
		}

		const { id } = await params;
		const activityId = parseInt(id);

		if (isNaN(activityId)) {
			return errorResponse("Invalid ID", 400);
		}

		// Soft delete
		const result = await prisma.activity.updateMany({
			where: {
				id: activityId,
				organizationId: authUser.organizationId,
				deletedAt: null,
			},
			data: {
				deletedAt: new Date(),
			},
		});

		if (result.count === 0) {
			return errorResponse("Activity not found", 404);
		}

		return successResponse(null, "Activity deleted successfully");
	} catch (error) {
		console.error("[ACTIVITY_DELETE]", error);
		return errorResponse("Internal server error", 500);
	}
}
