import { db } from "@/lib/db";
import { money } from "@/lib/format";
import { CouponForm } from "@/components/coupon-form";
import { toggleCoupon } from "@/app/actions/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Coupons" };

export default async function Coupons() {
  const coupons = await db.coupon.findMany({ orderBy: { id: "desc" } });
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl italic">Coupons</h1>
      <CouponForm />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b-2 border-stone-900/30 text-xs uppercase tracking-wider">
            <tr><th className="py-2">Code</th><th>Discount</th><th>Min order</th><th>Used</th><th>Expires</th><th>Status</th><th /></tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-stone-300">
                <td className="py-2 font-medium">{c.code}</td>
                <td>{c.type === "PERCENT" ? `${c.value}%` : money(c.value)}</td>
                <td>{c.minSubtotalCents ? money(c.minSubtotalCents) : "none"}</td>
                <td>{c.usedCount}{c.maxUses !== null ? ` / ${c.maxUses}` : ""}</td>
                <td>{c.expiresAt ? c.expiresAt.toLocaleDateString("en-IN") : "never"}</td>
                <td>{c.active ? "active" : "off"}</td>
                <td className="text-right"><form action={toggleCoupon.bind(null, c.id)}><button className="underline">{c.active ? "turn off" : "turn on"}</button></form></td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && <p className="mt-3 text-sm">No coupons yet.</p>}
      </div>
    </div>
  );
}
