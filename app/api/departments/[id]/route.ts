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

		const department = await prisma.department.findFirst({
			where: {
				id,
				division: {
					organizationId: user.organizationId,
				},
				deletedAt: null,
			},
			include: {
				division: true,
			},
		});

		if (!department) {
			return errorResponse("Department not found", 404);
		}

		return successResponse(department);
	} catch (error) {
		console.error("[DEPARTMENT_GET]", error);
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
		const { name, divisionId } = body;

		// Check if the department exists and belongs to the user's organization
		const existingDepartment = await prisma.department.findFirst({
			where: {
				id,
				division: {
					organizationId: user.organizationId,
				},
				deletedAt: null,
			},
		});

		if (!existingDepartment) {
			return errorResponse("Department not found", 404);
		}

		// If divisionId is being updated, verify ownership
		if (divisionId && divisionId !== existingDepartment.divisionId) {
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
		}

		const updatedDepartment = await prisma.department.update({
			where: { id },
			data: {
				name: name ?? undefined,
				divisionId: divisionId ?? undefined,
			},
		});

		return successResponse(updatedDepartment, "Department updated successfully");
	} catch (error) {
		console.error("[DEPARTMENT_PATCH]", error);
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

		const department = await prisma.department.findFirst({
			where: {
				id,
				division: {
					organizationId: user.organizationId,
				},
				deletedAt: null,
			},
		});

		if (!department) {
			return errorResponse("Department not found", 404);
		}

		// Soft delete
		await prisma.department.update({
			where: { id },
			data: {
				deletedAt: new Date(),
			},
		});

		return successResponse(null, "Department deleted successfully");
	} catch (error) {
		console.error("[DEPARTMENT_DELETE]", error);
		return errorResponse("Internal server error", 500);
	}
}
