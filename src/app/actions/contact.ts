"use server";

import { z } from "zod";
import { db } from "@/lib/db";

export type ContactState = { error?: string; sent?: boolean; values?: Record<string, string> } | undefined;

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email"),
  message: z.string().trim().min(5, "Message is too short").max(3000),
});

export async function sendMessage(_: ContactState, form: FormData): Promise<ContactState> {
  const values = { name: String(form.get("name") ?? ""), email: String(form.get("email") ?? ""), message: String(form.get("message") ?? "") };
  if (form.get("website")) return { sent: true }; // honeypot: bots fill the hidden field
  const r = schema.safeParse(values);
  if (!r.success) return { error: r.error.issues[0].message, values };
  await db.contactMessage.create({ data: r.data });
  return { sent: true };
}
