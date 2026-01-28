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

		const roles = await prisma.role.findMany({
			where: {
				deletedAt: null,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return successResponse(roles);
	} catch (error) {
		console.error("[ROLES_GET]", error);
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
		const { name, description } = body;

		if (!name) {
			return errorResponse("Name is required", 400);
		}

		const role = await prisma.role.create({
			data: {
				name,
				description,
			},
		});

		return successResponse(role, "Role created successfully", 201);
	} catch (error) {
		console.error("[ROLES_POST]", error);
		return errorResponse("Internal server error", 500);
	}
}
