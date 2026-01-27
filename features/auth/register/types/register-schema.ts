
import { z } from "zod";

export const RegisterSchema = z
  .object({
    fullName: z
      .string()
      .min(1, { message: "Full name is required" })
      .min(2, { message: "Full name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(1, { message: "Confirm Password is required" }),
    organizationName: z.string().min(1, { message: "Organization name is required" }),
    organizationSlug: z.string().min(1, { message: "Organization identifier is required" }),
    organizationAddress: z.string().min(1, { message: "Organization address is required" }),
    organizationPhone: z.string().min(1, { message: "Organization phone is required" }),
    organizationEmail: z.string().email({ message: "Invalid organization email" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterType = z.infer<typeof RegisterSchema>;
