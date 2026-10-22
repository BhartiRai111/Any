"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { checkPin, type DeliveryResult } from "@/lib/delivery";

export type AddressState = { error?: string; values?: Record<string, string> } | undefined;

const schema = z.object({
  label: z.string().trim().min(1, "Give the address a name, like Home").max(30),
  name: z.string().trim().min(1, "Name is required").max(100),
  address: z.string().trim().min(3, "Address is required").max(200),
  city: z.string().trim().min(1, "City is required").max(100),
  postalCode: z.string().trim().min(2, "Postal code is required").max(20),
  country: z.string().trim().min(2).max(60),
});

export async function addAddress(_: AddressState, form: FormData): Promise<AddressState> {
  const user = await currentUser();
  if (!user) return { error: "Sign in first" };
  const values = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>;
  const r = schema.safeParse(values);
  if (!r.success) return { error: r.error.issues[0].message, values };
  if (r.data.country.toLowerCase() === "india") {
    const pin = checkPin(r.data.postalCode);
    if (!pin.ok) return { error: pin.message, values };
  }
  const count = await db.address.count({ where: { userId: user.id } });
  if (count >= 10) return { error: "You can save up to 10 addresses", values };
  await db.address.create({ data: { ...r.data, userId: user.id, isDefault: count === 0 } });
  revalidatePath("/account/addresses");
  return undefined;
}

export async function deleteAddress(id: number) {
  const user = await currentUser();
  if (!user) return;
  await db.address.deleteMany({ where: { id, userId: user.id } });
  const left = await db.address.findMany({ where: { userId: user.id }, orderBy: { id: "asc" } });
  if (left.length > 0 && !left.some((a) => a.isDefault)) await db.address.update({ where: { id: left[0].id }, data: { isDefault: true } });
  revalidatePath("/account/addresses");
}

export async function makeDefaultAddress(id: number) {
  const user = await currentUser();
  if (!user) return;
  await db.$transaction([
    db.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } }),
    db.address.updateMany({ where: { id, userId: user.id }, data: { isDefault: true } }),
  ]);
  revalidatePath("/account/addresses");
}

export async function checkDelivery(pin: string): Promise<DeliveryResult> {
  return checkPin(pin);
}
