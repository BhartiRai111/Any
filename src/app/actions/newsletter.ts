"use server";

import { z } from "zod";
import { db } from "@/lib/db";

export type NewsletterState = { error?: string; done?: boolean } | undefined;

export async function subscribe(_: NewsletterState, form: FormData): Promise<NewsletterState> {
  const email = z.string().trim().toLowerCase().email("Enter a valid email").max(200).safeParse(form.get("email"));
  if (!email.success) return { error: email.error.issues[0].message };
  await db.subscriber.upsert({ where: { email: email.data }, update: {}, create: { email: email.data } });
  return { done: true };
}
