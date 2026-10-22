import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@/lib/session";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") notFound();
  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b-2 border-stone-200 pb-3 text-sm">
        <span className="stamp">Studio admin</span>
        <Link href="/admin" className="hover:underline">dashboard</Link>
        <Link href="/admin/products" className="hover:underline">products</Link>
        <Link href="/admin/orders" className="hover:underline">orders</Link>
        <Link href="/admin/coupons" className="hover:underline">coupons</Link>
        <Link href="/admin/reviews" className="hover:underline">reviews</Link>
        <Link href="/admin/messages" className="hover:underline">messages</Link>
      </nav>
      {children}
    </div>
  );
}
