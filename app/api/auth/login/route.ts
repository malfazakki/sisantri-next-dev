// Removed NextResponse import as it is unused
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { successResponse, errorResponse } from "@/lib/api-response";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { email, password } = body;

		if (!email || !password) {
			return errorResponse("Email and password are required", 400);
		}

		// Find user by email
		const user = await prisma.user.findUnique({
			where: { email },
			include: {
				profile: {
					include: {
						division: true,
						department: true,
					},
				},
				roles: {
					include: {
						role: true,
					},
				},
				organization: true,
			},
		});

		if (!user) {
			return errorResponse("Invalid credentials", 401);
		}

		// Verify password
		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			return errorResponse("Invalid credentials", 401);
		}

		// Generate JWT
		const token = jwt.sign(
			{
				userId: user.id,
				email: user.email,
				organizationId: user.organizationId,
				roles: user.roles.map((ur) => ur.role.name),
			},
			JWT_SECRET,
			{ expiresIn: "1d" },
		);

		// Return success response
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password: _, ...userWithoutPassword } = user;

		// Add name field for frontend compatibility
		if (user.profile) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(userWithoutPassword as any).name = user.profile.fullName;
		}

		return successResponse(
			{
				token,
				user: userWithoutPassword,
			},
			"Login successful",
		);
	} catch (error) {
		console.error("Login error:", error);
		return errorResponse("Internal server error", 500);
	}
}
