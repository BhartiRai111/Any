import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

export const siteUrl = () => (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");

let transport: Transporter | null | undefined;

function getTransport() {
  if (transport !== undefined) return transport;
  const host = process.env.SMTP_HOST;
  transport = host
    ? nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT || 587) === 465,
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      })
    : null;
  return transport;
}

/**
 * Sends a plain-text email. Without SMTP settings nothing is sent and the message is printed to the
 * server log instead, so password reset links still work in development.
 */
export async function sendMail({ to, subject, text }: { to: string; subject: string; text: string }): Promise<boolean> {
  const t = getTransport();
  if (!t) {
    console.log(`[mail not sent: SMTP is not configured]\nTo: ${to}\nSubject: ${subject}\n\n${text}\n`);
    return false;
  }
  try {
    await t.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER || "Willow & Clay <hello@willowandclay.example>", to, subject, text });
    return true;
  } catch (e) {
    console.error("mail failed", (e as Error).message);
    return false;
  }
}
