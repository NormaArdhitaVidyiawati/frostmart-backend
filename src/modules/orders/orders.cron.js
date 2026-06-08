import { db } from "../../config/db.config.js";
import * as ordersService from "./orders.service.js";

export const startOrderExpiryCheck = () => {
  console.log("[Expiry Cron] Starting Order Expiry Checker (runs every 30s)...");
  
  setInterval(async () => {
    try {
      // 10-minute unpaid expiration check
      const { rows } = await db.query(`
        SELECT o.id 
        FROM orders o
        JOIN transactions t ON t.order_id = o.id
        WHERE o.status = 'pending'
          AND o.created_at < NOW() - INTERVAL '10 minutes'
          AND t.payment_method != 'Bayar di Tempat (COD)'
          AND t.payment_status != 'paid'
      `);

      for (const order of rows) {
        console.log(`[Expiry Cron] Auto-cancelling expired order #${order.id}`);
        try {
          await ordersService.updateOrderStatus(order.id, "cancelled");
        } catch (err) {
          console.error(`[Expiry Cron] Failed to auto-cancel order #${order.id}:`, err);
        }
      }

      // 7-day processed (paid) to completed check
      const { rows: completedRows } = await db.query(`
        SELECT o.id 
        FROM orders o
        WHERE o.status = 'paid'
          AND o.processed_at IS NOT NULL
          AND o.processed_at < NOW() - INTERVAL '7 days'
      `);

      for (const order of completedRows) {
        console.log(`[Completion Cron] Auto-completing order #${order.id} after 7 days`);
        try {
          await ordersService.updateOrderStatus(order.id, "completed");
        } catch (err) {
          console.error(`[Completion Cron] Failed to auto-complete order #${order.id}:`, err);
        }
      }
    } catch (err) {
      console.error("[Expiry Cron] Error checking for expired or completed orders:", err);
    }
  }, 30000); // 30 seconds
};
