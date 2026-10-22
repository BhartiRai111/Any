import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@/lib/session";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") notFound();
  return (
    <div className="space-y-6">
      <nav className="flex gap-5 border-b-2 border-stone-900/20 pb-3 text-sm">
        <span className="stamp">Studio admin</span>
        <Link href="/admin/products" className="hover:underline">products</Link>
        <Link href="/admin/orders" className="hover:underline">orders</Link>
      </nav>
      {children}
    </div>
  );
}
