import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/server-auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { batchSchema } from "@/features/batch/types/batch-schema";

export async function GET() {
	try {
		const user = await getAuthUser();
		if (!user) {
			return errorResponse("Unauthorized", 401);
		}

		const batches = await prisma.batch.findMany({
			where: {
				organizationId: user.organizationId,
				deletedAt: null,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return successResponse(batches);
	} catch (error) {
		console.error("[BATCHES_GET]", error);
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
		const validatedData = batchSchema.safeParse(body);

		if (!validatedData.success) {
			return errorResponse(validatedData.error.issues[0].message, 400);
		}

		const { name, year, description } = validatedData.data;

		// Check for uniqueness: [name, organizationId, year]
		const existingBatch = await prisma.batch.findFirst({
			where: {
				name,
				year,
				organizationId: user.organizationId,
				deletedAt: null,
			},
		});

		if (existingBatch) {
			return errorResponse("Batch with this name and year already exists", 400);
		}

		const batch = await prisma.batch.create({
			data: {
				name,
				year,
				description,
				organizationId: user.organizationId,
			},
		});

		return successResponse(batch, "Batch created successfully", 201);
	} catch (error) {
		console.error("[BATCHES_POST]", error);
		return errorResponse("Internal server error", 500);
	}
}
