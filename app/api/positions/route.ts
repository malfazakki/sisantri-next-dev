import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/server-auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
	try {
		const user = await getAuthUser();
		if (!user) {
			return errorResponse("Unauthorized", 401);
		}

		const positions = await prisma.position.findMany({
			where: {
				organizationId: user.organizationId,
				deletedAt: null,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return successResponse(positions);
	} catch (error) {
		console.error("[POSITIONS_GET]", error);
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

		const position = await prisma.position.create({
			data: {
				name,
				description,
				organizationId: user.organizationId as string,
			},
		});

		return successResponse(position, "Position created successfully", 201);
	} catch (error) {
		console.error("[POSITIONS_POST]", error);
		return errorResponse("Internal server error", 500);
	}
}
