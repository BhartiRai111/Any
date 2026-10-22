import "server-only";
import { db } from "./db";
import { money } from "./format";
import { sendMail, siteUrl } from "./mail";
import { PAYMENT_METHODS, bankLines, type PaymentMethod } from "./store";

async function load(orderId: number) {
  return db.order.findUnique({ where: { id: orderId }, include: { items: true } });
}

export async function sendOrderConfirmation(orderId: number) {
  const o = await load(orderId);
  if (!o) return;
  const lines = o.items.map((i) => `  ${i.quantity} x ${i.name} (${i.size})  ${money(i.unitCents * i.quantity)}`).join("\n");
  const pay = PAYMENT_METHODS[o.paymentMethod as PaymentMethod] ?? o.paymentMethod;
  const bank = o.paymentMethod === "BANK_TRANSFER" ? `\nPlease transfer ${money(o.totalCents)} with reference "order ${o.id}":\n${bankLines().join("\n")}\n` : "";
  await sendMail({
    to: o.email,
    subject: `Order #${o.id} confirmed`,
    text: `Hi ${o.name},\n\nThank you for your order.\n\n${lines}\n${o.discountCents ? `  Discount (${o.couponCode})  -${money(o.discountCents)}\n` : ""}  Total  ${money(o.totalCents)}\n\nPayment: ${pay}${o.paymentStatus === "PAID" ? " (received)" : ""}\n${bank}\nShipping to:\n${o.name}\n${o.address}, ${o.city} ${o.postalCode}, ${o.country}\n${o.userId ? `\nInvoice: ${siteUrl()}/orders/${o.id}/invoice\n` : ""}\nWillow & Clay`,
  });
}

export async function sendShipped(orderId: number) {
  const o = await load(orderId);
  if (!o) return;
  await sendMail({
    to: o.email,
    subject: `Order #${o.id} has shipped`,
    text: `Hi ${o.name},\n\nYour order #${o.id} is on its way.\n${o.courier ? `Courier: ${o.courier}\n` : ""}${o.trackingNumber ? `Tracking number: ${o.trackingNumber}\n` : ""}\nWillow & Clay`,
  });
}

export async function sendPasswordReset(email: string, link: string) {
  await sendMail({
    to: email,
    subject: "Reset your password",
    text: `We received a request to reset your Willow & Clay password.\n\nOpen this link within 1 hour to choose a new one:\n${link}\n\nIf you did not ask for this, you can ignore this email.`,
  });
}
