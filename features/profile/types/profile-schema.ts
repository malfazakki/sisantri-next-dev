import { z } from "zod";

export const profileSchema = z.object({
	fullName: z.string().min(3, "Full name must be at least 3 characters"),
	avatar: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type ProfileValues = z.infer<typeof profileSchema>;
