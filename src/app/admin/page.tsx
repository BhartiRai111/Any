import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Dashboard" };

const TZ = "Asia/Kolkata";
const dayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ });

export default async function Dashboard() {
  const now = new Date();
  const since14 = new Date(now.getTime() - 14 * 86400000);
  // Revenue counts every order that is not cancelled, failed or refunded.
  const live: Prisma.OrderWhereInput = { status: { not: "CANCELLED" }, paymentStatus: { notIn: ["FAILED", "REFUNDED"] } };

  const [recent, best, low, toShip, messages, reviews] = await Promise.all([
    db.order.findMany({ where: { ...live, createdAt: { gte: new Date(now.getTime() - 30 * 86400000) } }, select: { createdAt: true, totalCents: true } }),
    db.orderItem.groupBy({ by: ["productId", "name"], where: { order: live }, _sum: { quantity: true }, orderBy: { _sum: { quantity: "desc" } }, take: 5 }),
    db.product.findMany({ where: { active: true, stock: { lte: 3 } }, orderBy: { stock: "asc" }, select: { id: true, name: true, stock: true } }),
    db.order.count({ where: { status: "PLACED", paymentStatus: { notIn: ["FAILED", "PENDING"] } } }),
    db.contactMessage.count(),
    db.review.count(),
  ]);

  const sum = (from: Date) => recent.filter((o) => o.createdAt >= from).reduce((n, o) => n + o.totalCents, 0);
  const count = (from: Date) => recent.filter((o) => o.createdAt >= from).length;
  const startToday = new Date(`${dayKey(now)}T00:00:00+05:30`);
  const periods = [
    { label: "Today", from: startToday },
    { label: "Last 7 days", from: new Date(now.getTime() - 7 * 86400000) },
    { label: "Last 30 days", from: new Date(now.getTime() - 30 * 86400000) },
  ];

  const days: { key: string; label: string; total: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    days.push({ key: dayKey(d), label: d.toLocaleDateString("en-IN", { timeZone: TZ, day: "numeric", month: "short" }), total: 0 });
  }
  for (const o of recent) if (o.createdAt >= since14) {
    const day = days.find((d) => d.key === dayKey(o.createdAt));
    if (day) day.total += o.totalCents;
  }
  const max = Math.max(1, ...days.map((d) => d.total));

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-4xl italic">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {periods.map((p) => (
          <div key={p.label} className="border border-stone-400 bg-white p-4">
            <p className="text-xs uppercase tracking-wider text-stone-600">{p.label}</p>
            <p className="mt-1 text-2xl font-semibold">{money(sum(p.from))}</p>
            <p className="text-sm text-stone-600">{count(p.from)} orders</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-3 font-serif text-2xl italic">Revenue, last 14 days</h2>
        <div className="flex h-40 items-end gap-1 border-b-2 border-stone-300" role="img" aria-label="Daily revenue for the last 14 days">
          {days.map((d) => (
            <div key={d.key} className="flex h-full flex-1 flex-col items-center justify-end" title={`${d.label}: ${money(d.total)}`}>
              <div className="w-full bg-[#b4653a]" style={{ height: `${Math.max(2, (d.total / max) * 100)}%` }} />
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-stone-600"><span>{days[0].label}</span><span>{days[days.length - 1].label}</span></div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="mb-3 font-serif text-2xl italic">Best sellers</h2>
          {best.length === 0 ? <p className="text-sm">No sales yet.</p> : (
            <ol className="space-y-1 text-sm">{best.map((b) => <li key={b.productId} className="flex justify-between border-b border-stone-300 py-1"><span>{b.name}</span><span>{b._sum.quantity} sold</span></li>)}</ol>
          )}
        </section>
        <section>
          <h2 className="mb-3 font-serif text-2xl italic">Low stock</h2>
          {low.length === 0 ? <p className="text-sm">Everything has 4 or more in stock.</p> : (
            <ul className="space-y-1 text-sm">
              {low.map((p) => <li key={p.id} className="flex justify-between border-b border-stone-300 py-1"><Link href={`/admin/products/${p.id}`} className="underline">{p.name}</Link><span className={p.stock === 0 ? "text-rose-600" : ""}>{p.stock === 0 ? "sold out" : `${p.stock} left`}</span></li>)}
            </ul>
          )}
        </section>
      </div>

      <p className="text-sm">
        <Link href="/admin/orders" className="underline">{toShip} {toShip === 1 ? "order" : "orders"} to ship</Link> · <Link href="/admin/messages" className="underline">{messages} {messages === 1 ? "message" : "messages"}</Link> · <Link href="/admin/reviews" className="underline">{reviews} {reviews === 1 ? "review" : "reviews"}</Link>
      </p>
    </div>
  );
}
