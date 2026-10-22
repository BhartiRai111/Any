import { db } from "@/lib/db";
import { money } from "@/lib/format";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/store";
import { setOrderStatus } from "@/app/actions/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Orders" };

const STATUSES = ["PLACED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default async function Orders() {
  const orders = await db.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div>
      <h1 className="font-serif text-4xl italic">Orders</h1>
      {orders.length === 0 ? <p className="mt-5">No orders yet.</p> : (
        <ul className="mt-5 space-y-4">
          {orders.map((o) => (
            <li key={o.id} className="border border-stone-400 bg-white p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-medium">#{o.id} · {o.createdAt.toLocaleString("en-US")} · {money(o.totalCents)} · {PAYMENT_METHODS[o.paymentMethod as PaymentMethod] ?? o.paymentMethod}</p>
                <form action={setOrderStatus.bind(null, o.id)} className="flex gap-2">
                  <select name="status" defaultValue={o.status} aria-label={`Status of order ${o.id}`} className="border border-stone-400 bg-white px-2 py-1">
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <button className="bg-stone-900 px-3 py-1 text-white">update</button>
                </form>
              </div>
              <p className="mt-2 text-stone-600">{o.name} · {o.email}<br />{o.address}, {o.city} {o.postalCode}, {o.country}</p>
              <ul className="mt-2">{o.items.map((i) => <li key={i.id}>{i.quantity} × {i.name} ({i.size})</li>)}</ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
