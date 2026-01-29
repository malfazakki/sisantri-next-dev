import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/server-auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { startOfDay } from "date-fns";

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
		const { searchParams } = new URL(request.url);
		const dateParam = searchParams.get("date");

		if (isNaN(activityId)) {
			return errorResponse("Invalid ID", 400);
		}

		if (!dateParam) {
			return errorResponse("Date is required", 400);
		}

		const date = startOfDay(new Date(dateParam));

		// Fetch all registrations for this activity
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
					},
				},
				attendances: {
					where: {
						date: date,
					},
					take: 1,
				},
			},
		});

		// Format response to include attendance status directly
		const data = registrations.map((reg) => ({
			profileId: reg.profileId,
			profile: reg.profile,
			status: reg.attendances.length > 0 ? reg.attendances[0].status : null,
			attendanceId: reg.attendances.length > 0 ? reg.attendances[0].id : null,
		}));

		return successResponse(data);
	} catch (error) {
		console.error("[ACTIVITY_ATTENDANCE_GET]", error);
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
		const { date: dateParam, attendances } = body; // attendances: Array of { profileId, status }

		if (isNaN(activityId)) {
			return errorResponse("Invalid ID", 400);
		}

		if (!dateParam || !Array.isArray(attendances)) {
			return errorResponse("Date and attendances array are required", 400);
		}

		const date = startOfDay(new Date(dateParam));

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

		// Use transaction to upsert attendances
		await prisma.$transaction(
			attendances.map((att) =>
				prisma.attendance.upsert({
					where: {
						profileId_activityId_date: {
							profileId: att.profileId,
							activityId,
							date,
						},
					},
					update: {
						status: att.status,
					},
					create: {
						profileId: att.profileId,
						activityId,
						date,
						status: att.status,
					},
				})
			)
		);

		return successResponse(null, "Attendance saved successfully");
	} catch (error) {
		console.error("[ACTIVITY_ATTENDANCE_POST]", error);
		return errorResponse("Internal server error", 500);
	}
}
