import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/server-auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getAuthUser();
		if (!user) {
			return errorResponse("Unauthorized", 401);
		}

		const { id } = await params;

		const position = await prisma.position.findFirst({
			where: {
				id,
				organizationId: user.organizationId as string,
				deletedAt: null,
			},
		});

		if (!position) {
			return errorResponse("Position not found", 404);
		}

		return successResponse(position);
	} catch (error) {
		console.error("[POSITION_GET]", error);
		return errorResponse("Internal server error", 500);
	}
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getAuthUser();
		if (!user) {
			return errorResponse("Unauthorized", 401);
		}

		const { id } = await params;
		const body = await request.json();
		const { name, description } = body;

		if (!name) {
			return errorResponse("Name is required", 400);
		}

		const position = await prisma.position.updateMany({
			where: {
				id,
				organizationId: user.organizationId as string,
				deletedAt: null,
			},
			data: {
				name,
				description,
			},
		});

		if (position.count === 0) {
			return errorResponse("Position not found or not owned by organization", 404);
		}

		const updatedPosition = await prisma.position.findUnique({
			where: { id },
		});

		return successResponse(updatedPosition, "Position updated successfully");
	} catch (error) {
		console.error("[POSITION_PATCH]", error);
		return errorResponse("Internal server error", 500);
	}
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getAuthUser();
		if (!user) {
			return errorResponse("Unauthorized", 401);
		}

		const { id } = await params;

		// Soft delete
		const position = await prisma.position.updateMany({
			where: {
				id,
				organizationId: user.organizationId as string,
				deletedAt: null,
			},
			data: {
				deletedAt: new Date(),
			},
		});

		if (position.count === 0) {
			return errorResponse("Position not found or not owned by organization", 404);
		}

		return successResponse(null, "Position deleted successfully");
	} catch (error) {
		console.error("[POSITION_DELETE]", error);
		return errorResponse("Internal server error", 500);
	}
}
