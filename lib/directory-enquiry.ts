import { z } from "zod";

export const directoryEnquirySchema = z.object({
  name: z.string().trim().min(2).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(8).max(40),
  postcode: z.string().trim().min(3).max(16),
  message: z.string().trim().min(10).max(4000),
});

export type DirectoryEnquiryInput = z.infer<typeof directoryEnquirySchema>;
