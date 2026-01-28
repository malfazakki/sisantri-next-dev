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
}
