// Removed NextResponse import as it is unused
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const {
			email,
			password,
			fullName,
			organizationName,
			organizationSlug,
			organizationAddress,
			organizationPhone,
			organizationEmail,
		} = body;

		// missing fields validation
		if (
			!email ||
			!password ||
			!fullName ||
			!organizationName ||
			!organizationSlug ||
			!organizationAddress ||
			!organizationPhone ||
			!organizationEmail
		) {
			return errorResponse("Missing required fields", 400);
		}

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return errorResponse("User with this email already exists", 409);
		}

		// Check if organization slug already exists
		const existingOrg = await prisma.organization.findUnique({
			where: { slug: organizationSlug },
		});

		if (existingOrg) {
			return errorResponse("Organization identifier (slug) already exists", 409);
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Transaction to create everything
		const result = await prisma.$transaction(async (tx) => {
			// 1. Ensure ADMIN role exists
			let adminRole = await tx.role.findUnique({
				where: { name: "ADMIN" },
			});

			if (!adminRole) {
				adminRole = await tx.role.create({
					data: {
						name: "ADMIN",
						description: "Administrator with full access",
					},
				});
			}

			// 2. Create Organization
			const organization = await tx.organization.create({
				data: {
					name: organizationName,
					slug: organizationSlug,
					address: organizationAddress,
					phone: organizationPhone,
					email: organizationEmail,
				},
			});

			// 3. Create User linked to Organization
			const user = await tx.user.create({
				data: {
					email,
					password: hashedPassword,
					organizationId: organization.id,
				},
			});

			// 4. Create Profile linked to User and Organization
			// Generate a simple employee ID or use a placeholder
			const empId = `ADMIN-${Date.now().toString().slice(-4)}`;

			const profile = await tx.profile.create({
				data: {
					userId: user.id,
					fullName,
					organizationId: organization.id,
					empId: empId,
				},
			});

			// 5. Assign ADMIN role to User
			await tx.userRole.create({
				data: {
					userId: user.id,
					roleId: adminRole.id,
				},
			});

			return { user, profile, organization };
		});

		// Return success (excluding password)
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password: _, ...userWithoutPassword } = result.user;

		return successResponse(
			{
				user: userWithoutPassword,
				profile: result.profile,
				organization: result.organization,
			},
			"Registration successful",
			201,
		);
	} catch (error) {
		console.error("Registration error:", error);
		return errorResponse("Internal server error", 500);
	}
}
