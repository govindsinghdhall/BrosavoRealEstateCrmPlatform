import { z } from "zod";
import { LEAD_STATUSES } from "@/utils/constants";

export const leadSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  phone: z.string().min(10, "Enter a valid phone number"),
  status: z.enum(LEAD_STATUSES),
  sourceId: z.coerce.number().int().positive("Source is required"),
  budget: z
    .number({ invalid_type_error: "Budget must be a number" })
    .min(0, "Budget must be positive"),
  propertyType: z.string().min(1, "Property type is required"),
  location: z.string().min(1, "Location is required"),
  assignedTo: z.coerce.number().int().positive().optional(),
  notes: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;
