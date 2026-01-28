// Removed NextResponse import as it is unused
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

		const division = await prisma.division.findFirst({
			where: {
				id,
				organizationId: user.organizationId,
				deletedAt: null,
			},
		});

		if (!division) {
			return errorResponse("Division not found", 404);
		}

		return successResponse(division);
	} catch (error) {
		console.error("[DIVISION_GET]", error);
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
		const { name } = body;

		if (!name) {
			return errorResponse("Name is required", 400);
		}

		const division = await prisma.division.updateMany({
			where: {
				id,
				organizationId: user.organizationId,
				deletedAt: null,
			},
			data: {
				name,
			},
		});

		if (division.count === 0) {
			return errorResponse("Division not found or not owned by organization", 404);
		}

		const updatedDivision = await prisma.division.findUnique({
			where: { id },
		});

		return successResponse(updatedDivision, "Division updated successfully");
	} catch (error) {
		console.error("[DIVISION_PATCH]", error);
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
		const division = await prisma.division.updateMany({
			where: {
				id,
				organizationId: user.organizationId,
				deletedAt: null,
			},
			data: {
				deletedAt: new Date(),
			},
		});

		if (division.count === 0) {
			return errorResponse("Division not found or not owned by organization", 404);
		}

		return successResponse(null, "Division deleted successfully");
	} catch (error) {
		console.error("[DIVISION_DELETE]", error);
		return errorResponse("Internal server error", 500);
	}
}
