"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { shippingFor } from "@/lib/shipping";
import { bankLines } from "@/lib/store";
import { createRazorpayOrder, razorpayEnabled, razorpayKeyId, verifyCheckoutSignature } from "@/lib/razorpay";
import { abandonUnpaid, markPaid } from "@/lib/payments";

export type PayRequest = { orderId: number; razorpayOrderId: string; amount: number; keyId: string; name: string; email: string };
export type CheckoutState = { error?: string; pay?: PayRequest; values?: Record<string, string> } | undefined;

function fields(form: FormData) {
  return Object.fromEntries([...form.entries()].filter(([k, v]) => k !== "lines" && typeof v === "string")) as Record<string, string>;
}

const lineSchema = z.object({
  productId: z.number().int().positive(),
  size: z.string().min(1).max(20),
  color: z.string().min(1).max(20),
  quantity: z.number().int().min(1).max(20),
});

const shipSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email"),
  address: z.string().trim().min(3, "Address is required").max(200),
  city: z.string().trim().min(1, "City is required").max(100),
  postalCode: z.string().trim().min(2, "Postal code is required").max(20),
  country: z.string().trim().min(2, "Country is required").max(60),
  paymentMethod: z.enum(["ONLINE", "COD", "BANK_TRANSFER"], { message: "Choose a payment method" }),
});

export async function placeOrder(_: CheckoutState, form: FormData): Promise<CheckoutState> {
  const result = await tryPlace(form);
  return result && { ...result, values: fields(form) };
}

async function tryPlace(form: FormData): Promise<{ error: string } | { pay: PayRequest } | undefined> {
  const ship = shipSchema.safeParse(Object.fromEntries(form));
  if (!ship.success) return { error: ship.error.issues[0].message };

  if (ship.data.paymentMethod === "BANK_TRANSFER" && bankLines().length === 0) return { error: "Bank transfer is not available right now." };

  if (ship.data.paymentMethod === "ONLINE" && !razorpayEnabled()) return { error: "Online payment is not available right now." };

  let rawLines: unknown;
  try {
    rawLines = JSON.parse(String(form.get("lines") ?? "[]"));
  } catch {
    return { error: "Your bag could not be read. Please try again." };
  }
  const lines = z.array(lineSchema).min(1, "Your bag is empty").max(50).safeParse(rawLines);
  if (!lines.success) return { error: lines.error.issues[0].message };

  // Prices and availability always come from the database, never from the browser.
  const products = await db.product.findMany({ where: { id: { in: lines.data.map((l) => l.productId) } } });
  const byId = new Map(products.map((p) => [p.id, p]));

  let subtotal = 0;
  const items: { productId: number; name: string; size: string; color: string; quantity: number; unitCents: number }[] = [];
  for (const l of lines.data) {
    const p = byId.get(l.productId);
    if (!p || !p.active) return { error: "An item in your bag is no longer available." };
    if (!p.sizes.includes(l.size) || !p.colors.includes(l.color)) return { error: `${p.name}: that size or colour is unavailable.` };
    if (l.quantity > p.stock) return { error: `${p.name}: only ${p.stock} left in stock.` };
    subtotal += p.priceCents * l.quantity;
    items.push({ productId: p.id, name: p.name, size: l.size, color: l.color, quantity: l.quantity, unitCents: p.priceCents });
  }
  const total = subtotal + shippingFor(subtotal);
  const user = await currentUser();

  const order = await db.$transaction(async (tx) => {
    for (const i of items) {
      const res = await tx.product.updateMany({
        where: { id: i.productId, stock: { gte: i.quantity } },
        data: { stock: { decrement: i.quantity } },
      });
      if (res.count === 0) throw new Error(`${i.name} just sold out`);
    }
    return tx.order.create({
      data: { ...ship.data, userId: user?.id ?? null, totalCents: total, items: { create: items } },
    });
  }).catch((e: Error) => e);

  if (order instanceof Error) return { error: order.message };

  if (order.paymentMethod === "ONLINE") {
    try {
      const razorpayOrderId = await createRazorpayOrder(order.totalCents, `order_${order.id}`);
      await db.order.update({ where: { id: order.id }, data: { razorpayOrderId } });
      return { pay: { orderId: order.id, razorpayOrderId, amount: order.totalCents, keyId: razorpayKeyId(), name: order.name, email: order.email } };
    } catch {
      // Could not start the payment, so give the stock back and drop the order.
      await db.$transaction(async (tx) => {
        for (const i of items) await tx.product.update({ where: { id: i.productId }, data: { stock: { increment: i.quantity } } });
        await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED", paymentStatus: "FAILED" } });
      });
      return { error: "We could not start the payment. Please try again or choose another method." };
    }
  }

  redirect(`/checkout/success?order=${order.id}&pay=${order.paymentMethod}`);
}

/** Called by the browser after Razorpay Checkout succeeds. The signature proves the payment is genuine. */
export async function confirmPayment(orderId: number, razorpayOrderId: string, paymentId: string, signature: string): Promise<{ ok: boolean }> {
  if (!verifyCheckoutSignature(razorpayOrderId, paymentId, signature)) return { ok: false };
  const order = await db.order.findFirst({ where: { id: orderId, razorpayOrderId }, select: { id: true } });
  if (!order) return { ok: false };
  await markPaid(razorpayOrderId, paymentId);
  return { ok: true };
}

/** Called when the customer closes the payment window without paying. */
export async function cancelUnpaidOrder(orderId: number, razorpayOrderId: string): Promise<void> {
  await abandonUnpaid(orderId, razorpayOrderId);
}
