import * as z from "zod";

export const divisionSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type DivisionFormValues = z.infer<typeof divisionSchema>;

export interface Division {
  id: string;
  name: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
