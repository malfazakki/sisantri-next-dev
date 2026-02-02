import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/server-auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const authUser = await getAuthUser();
		if (!authUser) {
			return errorResponse("Unauthorized", 401);
		}

		const { id } = await params;

		const user = await prisma.user.findFirst({
			where: {
				id,
				organizationId: authUser.organizationId,
				deletedAt: null,
			},
			include: {
				profile: {
					include: {
						division: true,
						department: true,
						position: true,
						batch: true,
					},
				},
				roles: {
					where: {
						deletedAt: null,
						role: {
							deletedAt: null,
						},
					},
					include: {
						role: true,
					},
				},
			},
		});

		if (!user) {
			return errorResponse("User not found", 404);
		}

		// Remove password from response
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password: _, ...userWithoutPassword } = user;

		return successResponse(userWithoutPassword);
	} catch (error) {
		console.error("[USER_GET]", error);
		return errorResponse("Internal server error", 500);
	}
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const authUser = await getAuthUser();
		if (!authUser) {
			return errorResponse("Unauthorized", 401);
		}

		const { id } = await params;
		const body = await request.json();
		const { email, fullName, empId, divisionId, departmentId, positionId, roleId, batchId, gender } = body;

		// Check if user exists and belongs to the same organization
		const existingUser = await prisma.user.findFirst({
			where: {
				id,
				organizationId: authUser.organizationId,
				deletedAt: null,
			},
		});

		if (!existingUser) {
			return errorResponse("User not found", 404);
		}

		// Validation: Check if empId already exists for ANOTHER user in the organization
		if (empId) {
			const existingEmpId = await prisma.profile.findFirst({
				where: {
					empId,
					organizationId: authUser.organizationId,
					userId: { not: id },
				},
			});

			if (existingEmpId) {
				return errorResponse("Employee ID already exists in this organization", 409);
			}
		}

		// Update in transaction

		const updatedUser = await prisma.$transaction(async (tx) => {
			// 1. Update User
			if (email) {
				await tx.user.update({
					where: { id },
					data: { email },
				});
			}

			// 2. Update Profile
			await tx.profile.update({
				where: { userId: id },
				data: {
					fullName: fullName !== undefined ? fullName : undefined,
					empId: empId !== undefined ? empId : undefined,
					gender: gender === "" ? null : gender || undefined,
					divisionId: divisionId || undefined,
					departmentId: departmentId === "" ? null : departmentId || undefined,
					positionId: positionId === "" ? null : positionId || undefined,
					batchId: batchId === "" ? null : batchId || undefined,
				},
			});

			// 3. Update Role (assuming single role)
			if (roleId) {
				// Delete existing user roles (hard delete for simplicity in junction table,
				// or soft delete if we want to keep history)
				await tx.userRole.deleteMany({
					where: { userId: id },
				});

				await tx.userRole.create({
					data: {
						userId: id,
						roleId,
					},
				});
			}

			return tx.user.findUnique({
				where: { id },
				include: {
					profile: {
						include: {
							division: true,
							department: true,
							position: true,
							batch: true,
						},
					},
					roles: {
						where: {
							deletedAt: null,
							role: {
								deletedAt: null,
							},
						},
						include: {
							role: true,
						},
					},
				},
			});
		});

		if (!updatedUser) {
			return errorResponse("Failed to update user", 500);
		}

		// Remove password
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password: __, ...userWithoutPassword } = updatedUser;

		return successResponse(userWithoutPassword, "User updated successfully");
	} catch (error) {
		console.error("[USER_PATCH]", error);
		return errorResponse("Internal server error", 500);
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const authUser = await getAuthUser();
		if (!authUser) {
			return errorResponse("Unauthorized", 401);
		}

		const { id } = await params;

		// Soft delete
		const result = await prisma.user.updateMany({
			where: {
				id,
				organizationId: authUser.organizationId,
				deletedAt: null,
			},
			data: {
				deletedAt: new Date(),
			},
		});

		if (result.count === 0) {
			return errorResponse("User not found or not authorized", 404);
		}

		return successResponse(null, "User deleted successfully");
	} catch (error) {
		console.error("[USER_DELETE]", error);
		return errorResponse("Internal server error", 500);
	}
}
