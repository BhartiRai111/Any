import { db } from "@/lib/db";
import { ProductForm } from "@/components/product-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · New product" };

export default async function NewProduct() {
  const categories = await db.category.findMany({ orderBy: { id: "asc" } });
  return (
    <div className="space-y-5">
      <h1 className="font-serif text-4xl italic">New product</h1>
      <ProductForm categories={categories} initial={{
        id: null, name: "", slug: "", categoryId: categories[0]?.id ?? 0, description: "", price: "", comparePrice: "",
        colors: "#c9795a", sizes: "One size", tone: "", imageUrl: "", stock: 10, featured: false, isNew: true, active: true,
      }} />
    </div>
  );
}
