"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/session";

export type ReviewState = { error?: string; done?: boolean } | undefined;

const schema = z.object({
  rating: z.coerce.number().int().min(1, "Choose a star rating").max(5, "Choose a star rating"),
  body: z.string().trim().min(3, "Write a few words about it").max(1000),
});

/** Only customers who have ordered the product (and not cancelled it) can review it. */
export async function canReview(userId: number, productId: number) {
  const n = await db.orderItem.count({ where: { productId, order: { userId, status: { not: "CANCELLED" }, paymentStatus: { notIn: ["FAILED", "REFUNDED"] } } } });
  return n > 0;
}

export async function submitReview(productId: number, slug: string, _: ReviewState, form: FormData): Promise<ReviewState> {
  const user = await currentUser();
  if (!user) return { error: "Sign in to write a review" };
  if (!(await canReview(user.id, productId))) return { error: "Only customers who ordered this piece can review it" };
  const r = schema.safeParse(Object.fromEntries(form));
  if (!r.success) return { error: r.error.issues[0].message };
  await db.review.upsert({
    where: { productId_userId: { productId, userId: user.id } },
    update: r.data,
    create: { ...r.data, productId, userId: user.id },
  });
  revalidatePath(`/product/${slug}`);
  return { done: true };
}
