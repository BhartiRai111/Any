import { verifyWebhookSignature } from "@/lib/razorpay";
import { markPaid } from "@/lib/payments";

export const dynamic = "force-dynamic";

type Payload = { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string } } } };

/** Razorpay calls this when a payment is captured, even if the customer closed the browser tab. */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers.get("x-razorpay-signature") ?? "")) {
    return new Response("Invalid signature", { status: 400 });
  }
  let body: Payload;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  if (body.event === "payment.captured" || body.event === "order.paid") {
    const pay = body.payload?.payment?.entity;
    if (pay?.order_id && pay.id) await markPaid(pay.order_id, pay.id);
  }
  return new Response("ok");
}
