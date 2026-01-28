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

		const registrations = await prisma.activityRegistration.findMany({
			where: {
				activityId,
				activity: {
					organizationId: authUser.organizationId,
				},
				deletedAt: null,
			},
			include: {
				profile: {
					include: {
						division: true,
						department: true,
						user: {
							select: {
								email: true,
							},
						},
					},
				},
			},
		});

		return successResponse(registrations);
	} catch (error) {
		console.error("[ACTIVITY_REGISTRATIONS_GET]", error);
		return errorResponse("Internal server error", 500);
	}
}

export async function POST(
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
		const { profileIds } = body; // Array of profile IDs

		if (isNaN(activityId)) {
			return errorResponse("Invalid ID", 400);
		}

		if (!Array.isArray(profileIds)) {
			return errorResponse("profileIds must be an array", 400);
		}

		// Verify activity belongs to organization
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

		// Use a transaction to update registrations
		// We'll perform a sync: remove those not in the list, add those who are new
		await prisma.$transaction(async (tx) => {
			// Get current registrations
			const currentRegistrations = await tx.activityRegistration.findMany({
				where: { activityId },
				select: { profileId: true },
			});

			const currentProfileIds = currentRegistrations.map((r) => r.profileId);

			// IDs to add
			const idsToAdd = profileIds.filter((id) => !currentProfileIds.includes(id));
			// IDs to remove
			const idsToRemove = currentProfileIds.filter((id) => !profileIds.includes(id));

			// Add new registrations
			if (idsToAdd.length > 0) {
				await tx.activityRegistration.createMany({
					data: idsToAdd.map((profileId) => ({
						activityId,
						profileId,
					})),
					skipDuplicates: true,
				});
			}

			// Soft delete removed registrations? 
			// The schema has deletedAt, so we should probably use it.
			// But for a sync, maybe hard delete is cleaner if it's just a join table?
			// Given deletedAt is there, let's use it or just hard delete if we want "sync" behavior.
			// Actually Prisma's `update` doesn't support bulk delete with deletedAt easily in a sync.
			// Let's just hard delete for now to keep it simple, or update deletedAt.
			
			if (idsToRemove.length > 0) {
				await tx.activityRegistration.deleteMany({
					where: {
						activityId,
						profileId: { in: idsToRemove },
					},
				});
			}
		});

		return successResponse(null, "Users assigned successfully");
	} catch (error) {
		console.error("[ACTIVITY_REGISTRATIONS_POST]", error);
		return errorResponse("Internal server error", 500);
	}
}
