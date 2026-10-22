import Link from "next/link";
import { db } from "@/lib/db";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Products" };

export default async function Products() {
  const products = await db.product.findMany({ include: { category: true }, orderBy: { id: "asc" } });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl italic">Products</h1>
        <Link href="/admin/products/new" className="bg-stone-900 px-4 py-2 text-white">new product</Link>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b-2 border-stone-900/30 text-xs uppercase tracking-wider">
            <tr><th className="py-2">Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th /></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-stone-300">
                <td className="py-2">{p.name}</td>
                <td>{p.category.name}</td>
                <td>{money(p.priceCents)}</td>
                <td className={p.stock === 0 ? "text-rose-600" : ""}>{p.stock}</td>
                <td>{p.active ? "live" : "hidden"}</td>
                <td className="text-right"><Link className="underline" href={`/admin/products/${p.id}`}>edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
