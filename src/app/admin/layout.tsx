import Link from "next/link";
import { notFound } from "next/navigation";
import { FiGrid, FiMessageSquare, FiPackage, FiShoppingBag, FiStar, FiTag } from "react-icons/fi";
import { currentUser } from "@/lib/session";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") notFound();
  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b-2 border-stone-200 pb-3 text-sm">
        <span className="stamp">Studio admin</span>
        <Link href="/admin" className="flex items-center gap-1.5 hover:text-brand"><FiGrid aria-hidden="true" /> dashboard</Link>
        <Link href="/admin/products" className="flex items-center gap-1.5 hover:text-brand"><FiShoppingBag aria-hidden="true" /> products</Link>
        <Link href="/admin/orders" className="flex items-center gap-1.5 hover:text-brand"><FiPackage aria-hidden="true" /> orders</Link>
        <Link href="/admin/coupons" className="flex items-center gap-1.5 hover:text-brand"><FiTag aria-hidden="true" /> coupons</Link>
        <Link href="/admin/reviews" className="flex items-center gap-1.5 hover:text-brand"><FiStar aria-hidden="true" /> reviews</Link>
        <Link href="/admin/messages" className="flex items-center gap-1.5 hover:text-brand"><FiMessageSquare aria-hidden="true" /> messages</Link>
      </nav>
      {children}
    </div>
  );
}
