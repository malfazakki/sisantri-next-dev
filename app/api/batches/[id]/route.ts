import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/server-auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { batchSchema } from "@/features/batch/types/batch-schema";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getAuthUser();
		if (!user) {
			return errorResponse("Unauthorized", 401);
		}

		const { id } = await params;

		const batch = await prisma.batch.findFirst({
			where: {
				id,
				organizationId: user.organizationId,
				deletedAt: null,
			},
		});

		if (!batch) {
			return errorResponse("Batch not found", 404);
		}

		return successResponse(batch);
	} catch (error) {
		console.error("[BATCH_GET]", error);
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
		const validatedData = batchSchema.safeParse(body);

		if (!validatedData.success) {
			return errorResponse(validatedData.error.issues[0].message, 400);
		}

		const { name, year, description } = validatedData.data;

		// Check for uniqueness: [name, organizationId, year] but exclude current ID
		const existingBatch = await prisma.batch.findFirst({
			where: {
				name,
				year,
				organizationId: user.organizationId,
				deletedAt: null,
				NOT: {
					id,
				},
			},
		});

		if (existingBatch) {
			return errorResponse("Batch with this name and year already exists", 400);
		}

		const batchUpdate = await prisma.batch.updateMany({
			where: {
				id,
				organizationId: user.organizationId,
				deletedAt: null,
			},
			data: {
				name,
				year,
				description,
			},
		});

		if (batchUpdate.count === 0) {
			return errorResponse("Batch not found or not owned by organization", 404);
		}

		const updatedBatch = await prisma.batch.findUnique({
			where: { id },
		});

		return successResponse(updatedBatch, "Batch updated successfully");
	} catch (error) {
		console.error("[BATCH_PATCH]", error);
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
		const batchDelete = await prisma.batch.updateMany({
			where: {
				id,
				organizationId: user.organizationId,
				deletedAt: null,
			},
			data: {
				deletedAt: new Date(),
			},
		});

		if (batchDelete.count === 0) {
			return errorResponse("Batch not found or not owned by organization", 404);
		}

		return successResponse(null, "Batch deleted successfully");
	} catch (error) {
		console.error("[BATCH_DELETE]", error);
		return errorResponse("Internal server error", 500);
	}
}
