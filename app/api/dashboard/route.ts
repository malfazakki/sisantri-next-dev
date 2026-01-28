// Removed NextResponse import as it is unused
import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
	try {
		// For now, let's just get the first organization or all data if no org is specified
		// In a real app, we'd get the organizationId from the session/token
		const organization = await prisma.organization.findFirst();

		if (!organization) {
			return successResponse({
				stats: {
					divisions: 0,
					departments: 0,
					users: 0,
				},
				users: [],
			});
		}

		const [divisionCount, departmentCount, userCount, users] = await Promise.all([
			prisma.division.count({ where: { organizationId: organization.id } }),
			prisma.department.count({
				where: {
					division: { organizationId: organization.id },
				},
			}),
			prisma.user.count({ where: { organizationId: organization.id } }),
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
			}),
		]);

		return successResponse({
			organizationName: organization.name,
			stats: {
				divisions: divisionCount,
				departments: departmentCount,
				users: userCount,
			},
			users: users.map((user) => ({
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
