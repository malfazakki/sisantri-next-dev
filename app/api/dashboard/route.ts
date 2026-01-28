import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getAuthUser } from "@/lib/server-auth";
import { startOfDay, endOfDay } from "date-fns";

export async function GET() {
	try {
		const authUser = await getAuthUser();

		if (!authUser) {
			return errorResponse("Unauthorized", 401);
		}

		const organization = await prisma.organization.findUnique({
			where: { id: authUser.organizationId },
		});

		if (!organization) {
			return errorResponse("Organization not found", 404);
		}

		const today = new Date();
		const startDate = startOfDay(today);
		const endDate = endOfDay(today);

		const [divisionCount, departmentCount, userCount, activityCount, recentUsers, attendanceToday] =
			await Promise.all([
				prisma.division.count({ where: { organizationId: organization.id } }),
				prisma.department.count({
					where: {
						division: { organizationId: organization.id },
					},
				}),
				prisma.user.count({ where: { organizationId: organization.id } }),
				prisma.activity.count({ where: { organizationId: organization.id } }),
				prisma.user.findMany({
					where: { organizationId: organization.id },
					include: {
						profile: true,
						roles: {
							include: {
								role: true,
							},
						},
					},
					orderBy: { createdAt: "desc" },
					take: 5,
				}),
				prisma.attendance.groupBy({
					by: ["status"],
					where: {
						activity: { organizationId: organization.id },
						date: {
							gte: startDate,
							lte: endDate,
						},
					},
					_count: true,
				}),
			]);

		const attendanceStats = {
			present: attendanceToday.find((a) => a.status === "H")?._count || 0,
			sick: attendanceToday.find((a) => a.status === "S")?._count || 0,
			permission: attendanceToday.find((a) => a.status === "I")?._count || 0,
			absent: attendanceToday.find((a) => a.status === "A")?._count || 0,
		};

		const totalAttendance = Object.values(attendanceStats).reduce((a, b) => a + b, 0);

		return successResponse({
			organizationName: organization.name,
			stats: {
				divisions: divisionCount,
				departments: departmentCount,
				users: userCount,
				activities: activityCount,
				attendanceToday: {
					...attendanceStats,
					total: totalAttendance,
				},
			},
			recentUsers: recentUsers.map((user) => ({
				id: user.id,
				email: user.email,
				fullName: user.profile?.fullName || "N/A",
				empId: user.profile?.empId || "N/A",
				roles: user.roles.map((ur) => ur.role.name),
				createdAt: user.createdAt,
			})),
		});
	} catch (error) {
		console.error("Dashboard error:", error);
		return errorResponse("Internal server error", 500);
	}
}
