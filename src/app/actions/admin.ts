"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { releaseCouponUse } from "@/lib/coupons";
import { sendShipped } from "@/lib/emails";
import { razorpayEnabled, refundPayment } from "@/lib/razorpay";

export type AdminState = { error?: string; values?: Record<string, string> } | undefined;

function fields(form: FormData) {
  return Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>;
}

const list = (v: string) => v.split(",").map((x) => x.trim()).filter(Boolean);
const dollars = z.coerce.number().min(0).max(100000).transform((n) => Math.round(n * 100));

const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug can only use lowercase letters, numbers and dashes").max(80),
  categoryId: z.coerce.number().int().positive("Choose a category"),
  description: z.string().trim().min(1, "Description is required").max(2000),
  price: dollars,
  comparePrice: z.string().trim().transform((v) => (v === "" ? null : Math.round(Number(v) * 100))).refine((v) => v === null || Number.isFinite(v), "Compare price must be a number"),
  colors: z.string().transform(list).refine((a) => a.length > 0 && a.every((c) => /^#[0-9a-fA-F]{6}$/.test(c)), "Glazes must be hex colours like #c9795a, separated by commas"),
  sizes: z.string().transform(list).refine((a) => a.length > 0, "Add at least one size"),
  tone: z.string().trim().max(200).refine((v) => v === "" || /^(linear|radial)-gradient\([#0-9a-zA-Z(),.% -]+\)$/.test(v) || /^#[0-9a-fA-F]{6}$/.test(v), "Placeholder must be a hex colour or a CSS gradient"),
  imageUrl: z.string().trim().refine((v) => v === "" || /^https:\/\/\S+$/.test(v) || /^\/products\/[\w.-]+$/.test(v), "Image must be an https:// link or a /products/ file").transform((v) => v || null),
  stock: z.coerce.number().int().min(0).max(100000),
});

function parse(form: FormData) {
  const r = productSchema.safeParse(Object.fromEntries(form));
  if (!r.success) return { error: r.error.issues[0].message } as const;
  const d = r.data;
  return {
    data: {
      ...d,
      tone: d.tone || "linear-gradient(135deg, #e4b184, #b4653a)",
      priceCents: d.price,
      comparePriceCents: d.comparePrice,
      featured: form.get("featured") === "on",
      isNew: form.get("isNew") === "on",
      active: form.get("active") === "on",
    },
  } as const;
}

function toRow(d: NonNullable<ReturnType<typeof parse>["data"]>) {
  const { price: _p, comparePrice: _c, ...row } = d; // eslint-disable-line @typescript-eslint/no-unused-vars
  return row;
}

export async function saveProduct(id: number | null, _: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin();
  const r = parse(form);
  if (!r.data) return { error: r.error, values: fields(form) };
  try {
    if (id) await db.product.update({ where: { id }, data: toRow(r.data) });
    else await db.product.create({ data: toRow(r.data) });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") return { error: "That slug is already used by another product", values: fields(form) };
    throw e;
  }
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function setOrderStatus(orderId: number, form: FormData) {
  await requireAdmin();
  const status = z.enum(["PLACED", "SHIPPED", "DELIVERED", "CANCELLED"]).parse(form.get("status"));
  await db.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
    if (order.status === status) return;
    // Cancelling returns stock; un-cancelling takes it back.
    if (status === "CANCELLED") {
      for (const i of order.items) await tx.product.update({ where: { id: i.productId }, data: { stock: { increment: i.quantity } } });
      await releaseCouponUse(tx, order.couponCode);
    } else if (order.status === "CANCELLED") {
      for (const i of order.items) {
        const res = await tx.product.updateMany({ where: { id: i.productId, stock: { gte: i.quantity } }, data: { stock: { decrement: i.quantity } } });
        if (res.count === 0) throw new Error(`Not enough stock of ${i.name} to restore this order`);
      }
    }
    await tx.order.update({ where: { id: orderId }, data: { status } });
  });
  revalidatePath("/admin/orders");
}

const trackingSchema = z.object({ courier: z.string().trim().min(1, "Courier is required").max(60), trackingNumber: z.string().trim().min(1, "Tracking number is required").max(80) });

export async function saveTracking(orderId: number, _: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin();
  const r = trackingSchema.safeParse(Object.fromEntries(form));
  if (!r.success) return { error: r.error.issues[0].message };
  const order = await db.order.findUnique({ where: { id: orderId }, select: { status: true, shippedAt: true } });
  if (!order || order.status === "CANCELLED") return { error: "This order cannot be shipped" };
  await db.order.update({ where: { id: orderId }, data: { ...r.data, status: "SHIPPED", shippedAt: order.shippedAt ?? new Date() } });
  if (!order.shippedAt) void sendShipped(orderId);
  revalidatePath("/admin/orders");
  return { error: undefined };
}

/** Refunds the full amount of a paid online order through Razorpay, then cancels the order and returns its stock. */
export async function refundOrder(orderId: number, _: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin();
  if (form.get("confirm") !== "on") return { error: "Tick the box to confirm the refund" };
  if (!razorpayEnabled()) return { error: "Razorpay is not configured" };
  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.paymentMethod !== "ONLINE" || order.paymentStatus !== "PAID" || !order.razorpayPaymentId) return { error: "This order has no refundable online payment" };
  let refundId: string;
  try {
    refundId = await refundPayment(order.razorpayPaymentId, order.totalCents);
  } catch (e) {
    return { error: (e as Error).message };
  }
  await db.$transaction(async (tx) => {
    if (order.status !== "CANCELLED") {
      for (const i of order.items) await tx.product.update({ where: { id: i.productId }, data: { stock: { increment: i.quantity } } });
      await releaseCouponUse(tx, order.couponCode);
    }
    await tx.order.update({ where: { id: orderId }, data: { paymentStatus: "REFUNDED", razorpayRefundId: refundId, refundedAt: new Date(), status: "CANCELLED" } });
  });
  revalidatePath("/admin/orders");
  return { error: undefined };
}

const couponSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,20}$/, "Code must be 3 to 20 letters, numbers, dashes or underscores"),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.coerce.number().positive("Value must be more than 0"),
  minSubtotal: z.coerce.number().min(0).default(0),
  maxUses: z.string().trim().transform((v) => (v === "" ? null : Number(v))).refine((v) => v === null || (Number.isInteger(v) && v > 0), "Max uses must be a whole number"),
  expiresAt: z.string().trim().transform((v) => (v === "" ? null : new Date(`${v}T23:59:59`))).refine((v) => v === null || !Number.isNaN(v.getTime()), "Expiry date is not valid"),
});

export async function createCoupon(_: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin();
  const r = couponSchema.safeParse(Object.fromEntries(form));
  if (!r.success) return { error: r.error.issues[0].message, values: fields(form) };
  const d = r.data;
  if (d.type === "PERCENT" && (d.value > 100 || !Number.isInteger(d.value))) return { error: "Percent must be a whole number from 1 to 100", values: fields(form) };
  try {
    await db.coupon.create({ data: { code: d.code, type: d.type, value: d.type === "PERCENT" ? d.value : Math.round(d.value * 100), minSubtotalCents: Math.round(d.minSubtotal * 100), maxUses: d.maxUses, expiresAt: d.expiresAt } });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") return { error: "That code already exists", values: fields(form) };
    throw e;
  }
  revalidatePath("/admin/coupons");
  return { error: undefined };
}

export async function toggleCoupon(id: number) {
  await requireAdmin();
  const c = await db.coupon.findUniqueOrThrow({ where: { id } });
  await db.coupon.update({ where: { id }, data: { active: !c.active } });
  revalidatePath("/admin/coupons");
}

export async function deleteReview(id: number) {
  await requireAdmin();
  const r = await db.review.delete({ where: { id }, include: { product: { select: { slug: true } } } });
  revalidatePath("/admin/reviews");
  revalidatePath(`/product/${r.product.slug}`);
}
