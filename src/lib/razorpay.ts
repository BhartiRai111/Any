import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

const apiBase = () => process.env.RAZORPAY_API_BASE || "https://api.razorpay.com/v1";

export const razorpayKeyId = () => process.env.RAZORPAY_KEY_ID || "";
const keySecret = () => process.env.RAZORPAY_KEY_SECRET || "";

/** Online payment is offered only when both API keys are configured. */
export const razorpayEnabled = () => Boolean(razorpayKeyId() && keySecret());

function safeEqualHex(expected: string, given: string) {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(given, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

const hmac = (secret: string, data: string) => createHmac("sha256", secret).update(data).digest("hex");

/** Signature Razorpay Checkout returns to the browser after a successful payment. */
export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string) {
  if (!keySecret()) return false;
  return safeEqualHex(hmac(keySecret(), `${orderId}|${paymentId}`), signature);
}

/** Signature on webhook calls, made with the separate webhook secret over the raw body. */
export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
  if (!secret || !signature) return false;
  return safeEqualHex(hmac(secret, rawBody), signature);
}

/** Creates the Razorpay order that the browser checkout pays against. Amount is in paise. */
export async function createRazorpayOrder(amountPaise: number, receipt: string): Promise<string> {
  const res = await fetch(`${apiBase()}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${razorpayKeyId()}:${keySecret()}`).toString("base64")}`,
    },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Razorpay order failed (${res.status})`);
  const data = (await res.json()) as { id?: string };
  if (!data.id) throw new Error("Razorpay returned no order id");
  return data.id;
}
