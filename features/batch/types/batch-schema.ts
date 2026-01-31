import * as z from "zod";

export const batchSchema = z.object({
  name: z.string().min(1, "Name is required"),
  year: z.string().min(1, "Year is required"),
  description: z.string().optional().nullable(),
});

export type BatchFormValues = z.infer<typeof batchSchema>;

export interface Batch {
  id: string;
  name: string;
  year: string;
  description: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
