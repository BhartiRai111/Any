import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { money } from "@/lib/format";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "My orders" };

export default async function Orders() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/orders");
  const orders = await db.order.findMany({ where: { userId: user.id }, include: { items: true }, orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="font-serif text-5xl italic">My orders</h1>
      {orders.length === 0 ? (
        <p className="mt-6 text-stone-600">You haven’t placed any orders yet.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((o) => (
            <li key={o.id} className="border border-stone-400 bg-white p-5 text-sm">
              <div className="flex flex-wrap justify-between gap-2 font-medium">
                <span>Order #{o.id} · {o.createdAt.toLocaleDateString("en-IN")}</span>
                <span>{money(o.totalCents)}</span>
              </div>
              <p className="text-stone-600">{o.status} · {PAYMENT_METHODS[o.paymentMethod as PaymentMethod] ?? o.paymentMethod} · payment {o.paymentStatus.toLowerCase()}</p>
              {o.trackingNumber && (
                <p className="mt-2">Tracking: {o.courier} <span className="select-all font-medium">{o.trackingNumber}</span></p>
              )}
              <ul className="mt-3 space-y-1">
                {o.items.map((i) => <li key={i.id}>{i.quantity} × {i.name} ({i.size})</li>)}
              </ul>
              <p className="mt-3"><Link href={`/orders/${o.id}/invoice`} className="underline">View invoice</Link></p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
