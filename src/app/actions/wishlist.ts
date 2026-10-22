"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/session";

export async function toggleWishlist(productId: number, slug: string) {
  const user = await currentUser();
  if (!user) redirect(`/login?next=/product/${slug}`);
  const key = { userId_productId: { userId: user.id, productId } };
  const existing = await db.wishlistItem.findUnique({ where: key });
  if (existing) await db.wishlistItem.delete({ where: key });
  else await db.wishlistItem.create({ data: { userId: user.id, productId } });
  revalidatePath(`/product/${slug}`);
  revalidatePath("/wishlist");
}
