import * as z from "zod";

export const positionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export type PositionFormValues = z.infer<typeof positionSchema>;

export interface Position {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
