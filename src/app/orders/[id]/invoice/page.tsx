import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { money } from "@/lib/format";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/store";
import { PrintButton } from "@/components/print-button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Invoice" };

export default async function Invoice({ params }: PageProps<"/orders/[id]/invoice">) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) notFound();
  const user = await currentUser();
  if (!user) redirect(`/login?next=/orders/${orderId}/invoice`);
  const o = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!o || (o.userId !== user.id && user.role !== "ADMIN")) notFound();
  const subtotal = o.items.reduce((n, i) => n + i.unitCents * i.quantity, 0);
  const shipping = o.totalCents - subtotal + o.discountCents;
  return (
    <div className="mx-auto max-w-2xl space-y-6 border border-stone-400 bg-white p-8 text-sm">
      <div className="flex justify-between">
        <div>
          <p className="font-serif text-3xl italic">Willow &amp; Clay</p>
          <p className="text-stone-600">Invoice #{o.id}</p>
        </div>
        <p className="text-right">{o.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
      </div>
      <div>
        <p className="font-medium">Bill and ship to</p>
        <p>{o.name}<br />{o.address}<br />{o.city} {o.postalCode}, {o.country}<br />{o.email}</p>
      </div>
      <table className="w-full text-left">
        <thead className="border-b-2 border-stone-300 text-xs uppercase"><tr><th className="py-2">Item</th><th>Qty</th><th className="text-right">Price</th><th className="text-right">Amount</th></tr></thead>
        <tbody>
          {o.items.map((i) => (
            <tr key={i.id} className="border-b border-stone-300">
              <td className="py-2">{i.name} ({i.size})</td><td>{i.quantity}</td>
              <td className="text-right">{money(i.unitCents)}</td><td className="text-right">{money(i.unitCents * i.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="ml-auto w-60 space-y-1">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
        {o.discountCents > 0 && <div className="flex justify-between gap-3"><dt>Discount ({o.couponCode})</dt><dd>-{money(o.discountCents)}</dd></div>}
        <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping > 0 ? money(shipping) : "Free"}</dd></div>
        <div className="flex justify-between border-t border-stone-400 pt-2 text-base font-semibold"><dt>Total</dt><dd>{money(o.totalCents)}</dd></div>
      </dl>
      <p>Payment: {PAYMENT_METHODS[o.paymentMethod as PaymentMethod] ?? o.paymentMethod} ({o.paymentStatus.toLowerCase()}){o.razorpayPaymentId ? ` · ref ${o.razorpayPaymentId}` : ""}</p>
      <PrintButton />
    </div>
  );
}
