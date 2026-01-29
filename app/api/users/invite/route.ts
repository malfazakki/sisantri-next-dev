import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { getAuthUser } from "@/lib/server-auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(request: Request) {
	try {
		const authUser = await getAuthUser();

		if (!authUser) {
			return errorResponse("Unauthorized", 401);
		}

		// Check if user is ADMIN
		if (!authUser.roles.includes("ADMIN")) {
			return errorResponse("Forbidden: Admin access required", 403);
		}

		const body = await request.json();
		const { email, fullName, empId, roleId, divisionId, departmentId, positionId } = body;

		// Validation
		if (!email || !fullName || !empId || !roleId || !divisionId) {
			return errorResponse("Missing required fields", 400);
		}

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return errorResponse("User with this email already exists", 409);
		}

		// Check if empId already exists in the organization
		const existingEmpId = await prisma.profile.findFirst({
			where: {
				empId,
				organizationId: authUser.organizationId,
			},
		});

		if (existingEmpId) {
			return errorResponse("Employee ID already exists in this organization", 409);
		}

		// Check if role exists
		const role = await prisma.role.findUnique({
			where: { id: roleId },
		});

		if (!role) {
			return errorResponse("Role not found", 404);
		}

		// Check if division exists and belongs to organization
		const division = await prisma.division.findFirst({
			where: {
				id: divisionId,
				organizationId: authUser.organizationId,
				deletedAt: null,
			},
		});

		if (!division) {
			return errorResponse("Division not found", 404);
		}

		// If departmentId is provided, check if it exists and belongs to the division
		if (departmentId) {
			const department = await prisma.department.findFirst({
				where: {
					id: departmentId,
					divisionId: divisionId,
					deletedAt: null,
				},
			});

			if (!department) {
				return errorResponse("Department not found in the selected division", 404);
			}
		}

		// Default password: Password@123
		const defaultPassword = "Password@123";
		const hashedPassword = await bcrypt.hash(defaultPassword, 10);

		// Transaction to create user, profile, and role
		const result = await prisma.$transaction(async (tx) => {
			// 1. Create User
			const user = await tx.user.create({
				data: {
					email,
					password: hashedPassword,
					organizationId: authUser.organizationId,
				},
			});

			// 2. Create Profile
			const profile = await tx.profile.create({
				data: {
					userId: user.id,
					fullName,
					empId,
					organizationId: authUser.organizationId,
					divisionId: divisionId,
					departmentId: departmentId || null,
					positionId: positionId || null,
				},
			});

			// 3. Assign Role
			await tx.userRole.create({
				data: {
					userId: user.id,
					roleId: roleId,
				},
			});

			return { user, profile, role };
		});

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password: _, ...userWithoutPassword } = result.user;

		return successResponse(
			{
				user: userWithoutPassword,
				profile: result.profile,
				role: result.role,
			},
			"User invited successfully",
			201,
		);
	} catch (error: unknown) {
		console.error("[USER_INVITE_POST]", error);
		return errorResponse("Internal server error", 500);
	}
}
