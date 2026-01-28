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

		const divisions = await prisma.division.findMany({
			where: {
				organizationId: user.organizationId,
				deletedAt: null,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return successResponse(divisions);
	} catch (error) {
		console.error("[DIVISIONS_GET]", error);
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
		const { name } = body;

		if (!name) {
			return errorResponse("Name is required", 400);
		}

		const division = await prisma.division.create({
			data: {
				name,
				organizationId: user.organizationId,
			},
		});

		return successResponse(division, "Division created successfully", 201);
	} catch (error) {
		console.error("[DIVISIONS_POST]", error);
		return errorResponse("Internal server error", 500);
	}
}
