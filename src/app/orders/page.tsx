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
      <h1 className="font-serif text-3xl">My orders</h1>
      {orders.length === 0 ? (
        <p className="mt-6 text-stone-600">You haven’t placed any orders yet.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((o) => (
            <li key={o.id} className="rounded-sm border border-stone-200 p-5 text-sm">
              <div className="flex justify-between font-medium">
                <span>Order #{o.id} · {o.createdAt.toLocaleDateString("en-US")}</span>
                <span>{money(o.totalCents)}</span>
              </div>
              <p className="text-stone-500">{o.status} · {PAYMENT_METHODS[o.paymentMethod as PaymentMethod] ?? o.paymentMethod} · payment {o.paymentStatus.toLowerCase()}</p>
              <ul className="mt-3 space-y-1">
                {o.items.map((i) => <li key={i.id}>{i.quantity} × {i.name} ({i.size})</li>)}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
