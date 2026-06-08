import { z } from "zod";

export const createAddressSchema = z.object({
  address_type: z.enum(["rumah", "kantor", "apartemen", "kos", "lainnya"]),
  recipient_name: z.string().trim().min(3).max(150),
  city_district: z.string().trim().min(2).max(150),
  postal_code: z.string().trim().min(3).max(20),
  full_address: z.string().trim().min(5).max(1000),
  is_primary: z.boolean().optional(),
});

export const updateAddressSchema = createAddressSchema.partial();