import "server-only";
import { db } from "./db";
import { releaseCouponUse } from "./coupons";
import { sendOrderConfirmation } from "./emails";

/** Marks an online order as paid. Safe to call twice (checkout redirect and webhook both call it). */
export async function markPaid(razorpayOrderId: string, paymentId: string) {
  const res = await db.order.updateMany({
    where: { razorpayOrderId, paymentStatus: { not: "PAID" } },
    data: { paymentStatus: "PAID", razorpayPaymentId: paymentId },
  });
  if (res.count > 0) {
    const order = await db.order.findUnique({ where: { razorpayOrderId }, select: { id: true } });
    if (order) void sendOrderConfirmation(order.id);
  }
  return res.count > 0;
}

/**
 * Cancels an online order whose payment never completed and returns its stock.
 * Does nothing once the payment has been recorded as paid.
 */
export async function abandonUnpaid(orderId: number, razorpayOrderId: string) {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: orderId, razorpayOrderId, paymentMethod: "ONLINE", paymentStatus: "PENDING", status: "PLACED" },
      include: { items: true },
    });
    if (!order) return false;
    for (const i of order.items) await tx.product.update({ where: { id: i.productId }, data: { stock: { increment: i.quantity } } });
    await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED", paymentStatus: "FAILED" } });
    await releaseCouponUse(tx, order.couponCode);
    return true;
  });
}
