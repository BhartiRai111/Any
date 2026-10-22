import "server-only";
import type { Coupon, Prisma } from "@prisma/client";
import { db } from "./db";
import { money } from "./format";

export type CouponResult = { ok: true; coupon: Coupon; discount: number } | { ok: false; error: string };

export function discountFor(c: Pick<Coupon, "type" | "value">, subtotal: number) {
  const raw = c.type === "PERCENT" ? Math.floor((subtotal * c.value) / 100) : c.value;
  return Math.max(0, Math.min(raw, subtotal));
}

export async function checkCoupon(code: string, subtotal: number): Promise<CouponResult> {
  const c = await db.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!c || !c.active) return { ok: false, error: "That code is not valid" };
  if (c.expiresAt && c.expiresAt < new Date()) return { ok: false, error: "That code has expired" };
  if (c.maxUses !== null && c.usedCount >= c.maxUses) return { ok: false, error: "That code has been used up" };
  if (subtotal < c.minSubtotalCents) return { ok: false, error: `Spend ${money(c.minSubtotalCents)} or more to use this code` };
  return { ok: true, coupon: c, discount: discountFor(c, subtotal) };
}

/** Takes one use of a coupon inside a transaction; false when it was used up in the meantime. */
export async function takeCouponUse(tx: Prisma.TransactionClient, c: Coupon) {
  const res = await tx.coupon.updateMany({
    where: c.maxUses === null ? { id: c.id } : { id: c.id, usedCount: { lt: c.maxUses } },
    data: { usedCount: { increment: 1 } },
  });
  return res.count > 0;
}

export async function releaseCouponUse(tx: Prisma.TransactionClient, code: string | null) {
  if (!code) return;
  await tx.coupon.updateMany({ where: { code, usedCount: { gt: 0 } }, data: { usedCount: { decrement: 1 } } });
}
