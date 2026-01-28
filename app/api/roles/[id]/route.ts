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

		const role = await prisma.role.findFirst({
			where: {
				id,
				deletedAt: null,
			},
		});

		if (!role) {
			return errorResponse("Role not found", 404);
		}

		return successResponse(role);
	} catch (error) {
		console.error("[ROLE_GET]", error);
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

		const existingRole = await prisma.role.findFirst({
			where: {
				id,
				deletedAt: null,
			},
		});

		if (!existingRole) {
			return errorResponse("Role not found", 404);
		}

		const updatedRole = await prisma.role.update({
			where: { id },
			data: {
				name: name ?? undefined,
				description: description ?? undefined,
			},
		});

		return successResponse(updatedRole, "Role updated successfully");
	} catch (error) {
		console.error("[ROLE_PATCH]", error);
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

		const role = await prisma.role.findFirst({
			where: {
				id,
				deletedAt: null,
			},
		});

		if (!role) {
			return errorResponse("Role not found", 404);
		}

		// Soft delete
		await prisma.role.update({
			where: { id },
			data: {
				deletedAt: new Date(),
			},
		});

		return successResponse(null, "Role deleted successfully");
	} catch (error) {
		console.error("[ROLE_DELETE]", error);
		return errorResponse("Internal server error", 500);
	}
}
