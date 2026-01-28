import * as z from "zod";
import { Division } from "../../division/types/division-schema";

export const departmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  divisionId: z.string().min(1, "Division is required"),
});

export type DepartmentFormValues = z.infer<typeof departmentSchema>;

export interface Department {
  id: string;
  name: string;
  divisionId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  division?: Division;
}
