import { z } from "zod";

export const inviteUserSchema = z.object({
	fullName: z.string().min(1, "Full name is required"),
	empId: z.string().min(1, "Employee ID is required"),
	email: z.string().email("Invalid email address"),
	roleId: z.string().min(1, "Role is required"),
	divisionId: z.string().min(1, "Division is required"),
	departmentId: z.string().optional(),
});

export type InviteUserValues = z.infer<typeof inviteUserSchema>;

export interface User {
	id: string;
	email: string;
	createdAt: string;
	profile?: {
		id: string;
		fullName: string;
		empId: string;
		division?: {
			id: string;
			name: string;
		};
		department?: {
			id: string;
			name: string;
		};
	};
	roles: {
		role: {
			id: string;
			name: string;
		};
	}[];
}

export interface PaginatedUserResponse {
	users: User[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}
