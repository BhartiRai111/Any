"use server";

import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendPasswordReset } from "@/lib/emails";
import { siteUrl } from "@/lib/mail";

export type ResetState = { error?: string; sent?: boolean } | undefined;

const sha = (t: string) => createHash("sha256").update(t).digest("hex");

/** Always answers the same way, so nobody can use it to find out which emails have accounts. */
export async function requestReset(_: ResetState, form: FormData): Promise<ResetState> {
  const email = z.string().trim().toLowerCase().email().safeParse(form.get("email"));
  if (!email.success) return { error: "Enter a valid email" };
  const user = await db.user.findUnique({ where: { email: email.data } });
  if (user) {
    const token = randomBytes(32).toString("hex");
    await db.$transaction([
      db.passwordReset.deleteMany({ where: { userId: user.id } }),
      db.passwordReset.create({ data: { userId: user.id, tokenHash: sha(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) } }),
    ]);
    await sendPasswordReset(user.email, `${siteUrl()}/reset-password?token=${token}`);
  }
  return { sent: true };
}

export async function resetPassword(_: ResetState, form: FormData): Promise<ResetState> {
  const token = String(form.get("token") ?? "");
  const password = String(form.get("password") ?? "");
  if (password.length < 8 || password.length > 100) return { error: "Password must be 8 to 100 characters" };
  const row = await db.passwordReset.findUnique({ where: { tokenHash: sha(token) } });
  if (!row || row.usedAt || row.expiresAt < new Date()) return { error: "This link has expired. Ask for a new one." };
  await db.$transaction([
    db.user.update({ where: { id: row.userId }, data: { passwordHash: await bcrypt.hash(password, 12) } }),
    db.passwordReset.deleteMany({ where: { userId: row.userId } }),
  ]);
  redirect("/login?reset=1");
}
