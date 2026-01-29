import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/server-auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { Prisma } from "@/lib/generated/prisma/client";

export async function GET(req: Request) {
	try {
		const authUser = await getAuthUser();

		if (!authUser) {
			return errorResponse("Unauthorized", 401);
		}

		const { searchParams } = new URL(req.url);
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");
		const search = searchParams.get("search") || "";
		const divisionId = searchParams.get("divisionId");
		const departmentId = searchParams.get("departmentId");
		const roleId = searchParams.get("roleId");

		const skip = (page - 1) * limit;

		const where: Prisma.UserWhereInput = {
			organizationId: authUser.organizationId,
			deletedAt: null,
		};

		if (search) {
			where.OR = [
				{ email: { contains: search, mode: "insensitive" } },
				{ profile: { fullName: { contains: search, mode: "insensitive" } } },
				{ profile: { empId: { contains: search, mode: "insensitive" } } },
			];
		}

		if (divisionId || departmentId) {
			const profileWhere: Prisma.ProfileWhereInput = {};
			if (divisionId) profileWhere.divisionId = divisionId;
			if (departmentId) profileWhere.departmentId = departmentId;
			where.profile = profileWhere;
		}

		if (roleId) {
			where.roles = {
				some: {
					roleId,
					deletedAt: null,
					role: {
						deletedAt: null,
					},
				},
			};
		}

		const [users, total] = await Promise.all([
			prisma.user.findMany({
				where,
				include: {
					profile: {
						include: {
							division: true,
							department: true,
						},
					},
					roles: {
						where: {
							deletedAt: null,
							role: {
								deletedAt: null,
							},
						},
						include: {
							role: true,
						},
					},
				},

				orderBy: {
					createdAt: "desc",
				},
				skip,
				take: limit,
			}),
			prisma.user.count({ where }),
		]);

		return successResponse({
			users,
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("[USERS_GET]", error);
		return errorResponse("Internal server error", 500);
	}
}
