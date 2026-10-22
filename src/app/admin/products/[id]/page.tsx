import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/product-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Edit product" };

export default async function EditProduct({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const pid = Number(id);
  if (!Number.isInteger(pid)) notFound();
  const [p, categories] = await Promise.all([db.product.findUnique({ where: { id: pid } }), db.category.findMany({ orderBy: { id: "asc" } })]);
  if (!p) notFound();
  return (
    <div className="space-y-5">
      <h1 className="font-serif text-4xl italic">Edit {p.name}</h1>
      <ProductForm categories={categories} initial={{
        id: p.id, name: p.name, slug: p.slug, categoryId: p.categoryId, description: p.description,
        price: (p.priceCents / 100).toFixed(2), comparePrice: p.comparePriceCents ? (p.comparePriceCents / 100).toFixed(2) : "",
        colors: p.colors.join(", "), sizes: p.sizes.join(", "), tone: p.tone, imageUrl: p.imageUrl ?? "",
        stock: p.stock, featured: p.featured, isNew: p.isNew, active: p.active,
      }} />
    </div>
  );
}
