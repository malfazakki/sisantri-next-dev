import { z } from "zod";

export const activitySchema = z.object({
	name: z.string().min(1, "Name is required"),
});

export type ActivityFormValues = z.infer<typeof activitySchema>;

export interface Activity {
	id: number;
	name: string;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	_count?: {
		activityRegistrations: number;
	};
}

export interface ActivityRegistration {
	id: string;
	profileId: string;
	activityId: number;
	createdAt: string;
	updatedAt: string;
	profile: {
		id: string;
		fullName: string;
		empId: string;
		division?: { name: string };
		department?: { name: string };
		user: {
			email: string;
		};
	};
}

export const assignUsersSchema = z.object({
	profileIds: z.array(z.string()),
});

export type AssignUsersValues = z.infer<typeof assignUsersSchema>;

export interface Attendance {
	profileId: string;
	profile: ActivityRegistration["profile"];
	status: string | null;
	attendanceId: string | null;
}

export const attendanceStatus = {
	PRESENT: "H",
	SICK: "S",
	PERMISSION: "I",
	ABSENT: "A",
} as const;

export const updateAttendanceSchema = z.object({
	date: z.date(),
	attendances: z.array(
		z.object({
			profileId: z.string(),
			status: z.string(),
		}),
	),
});

export type UpdateAttendanceValues = z.infer<typeof updateAttendanceSchema>;

