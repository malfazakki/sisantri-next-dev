// Removed NextResponse import as it is unused
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/server-auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
	try {
		const user = await getAuthUser();
		if (!user) {
			return errorResponse("Unauthorized", 401);
		}

		const departments = await prisma.department.findMany({
			where: {
				division: {
					organizationId: user.organizationId,
				},
				deletedAt: null,
			},
			include: {
				division: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return successResponse(departments);
	} catch (error) {
		console.error("[DEPARTMENTS_GET]", error);
		return errorResponse("Internal server error", 500);
	}
}

export async function POST(request: Request) {
	try {
		const user = await getAuthUser();
		if (!user) {
			return errorResponse("Unauthorized", 401);
		}

		const body = await request.json();
		const { name, divisionId } = body;

		if (!name || !divisionId) {
			return errorResponse("Name and Division ID are required", 400);
		}

		// Verify if division belongs to the user's organization
		const division = await prisma.division.findFirst({
			where: {
				id: divisionId,
				organizationId: user.organizationId,
				deletedAt: null,
			},
		});

		if (!division) {
			return errorResponse("Invalid Division ID or access denied", 403);
		}

		const department = await prisma.department.create({
			data: {
				name,
				divisionId,
			},
		});

		return successResponse(department, "Department created successfully", 201);
	} catch (error) {
		console.error("[DEPARTMENTS_POST]", error);
		return errorResponse("Internal server error", 500);
	}
}
