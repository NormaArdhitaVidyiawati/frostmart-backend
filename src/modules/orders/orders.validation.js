import { z } from "zod";

export const createOrderSchema = z.object({
  payment_method: z.string().min(2).max(50).default("cash"),
  items: z
    .array(
      z.object({
        product_id: z.number().int().positive(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "Order items cannot be empty"),
  shippingAddress: z.string().optional().nullable(),
  shipping_address: z.string().optional().nullable(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "paid", "cancelled", "completed"]),
});
