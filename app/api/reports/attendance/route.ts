import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getAuthUser } from "@/lib/server-auth";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(request: Request) {
	try {
		const authUser = await getAuthUser();

		if (!authUser) {
			return errorResponse("Unauthorized", 401);
		}

		const { searchParams } = new URL(request.url);
		const fromParam = searchParams.get("from");
		const toParam = searchParams.get("to");
		
		const fromDate = fromParam ? startOfDay(new Date(fromParam)) : startOfDay(new Date());
		const toDate = toParam ? endOfDay(new Date(toParam)) : endOfDay(fromDate);

		// Get all activities for the organization
		const activities = await prisma.activity.findMany({
			where: {
				organizationId: authUser.organizationId,
				deletedAt: null,
			},
			include: {
				_count: {
					select: {
						activityRegistrations: {
							where: { deletedAt: null },
						},
					},
				},
				attendances: {
					where: {
						date: {
							gte: fromDate,
							lte: toDate,
						},
					},
				},
			},
		});

		const reportData = activities.map((activity) => {
			const attendances = activity.attendances;
			const stats = {
				present: attendances.filter((a) => a.status === "H").length,
				sick: attendances.filter((a) => a.status === "S").length,
				permission: attendances.filter((a) => a.status === "I").length,
				absent: attendances.filter((a) => a.status === "A").length,
			};

			const totalRegistered = activity._count.activityRegistrations;
			const totalPresent = stats.present + stats.sick + stats.permission + stats.absent;

			return {
				id: activity.id,
				name: activity.name,
				stats: {
					...stats,
					totalRegistered,
					totalPresent,
					percentage: totalRegistered > 0 ? Math.round((totalPresent / totalRegistered) * 100) : 0,
				},
			};
		});

		return successResponse(reportData);
	} catch (error) {
		console.error("Attendance report error:", error);
		return errorResponse("Internal server error", 500);
	}
}
