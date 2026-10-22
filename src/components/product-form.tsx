"use client";

import { useActionState } from "react";
import { saveProduct, type AdminState } from "@/app/actions/admin";

type Initial = {
  id: number | null; name: string; slug: string; categoryId: number; description: string; price: string; comparePrice: string;
  colors: string; sizes: string; tone: string; imageUrl: string; stock: number; featured: boolean; isNew: boolean; active: boolean;
};

export function ProductForm({ initial, categories }: { initial: Initial; categories: { id: number; name: string }[] }) {
  const [state, action, pending] = useActionState((s: AdminState, f: FormData) => saveProduct(initial.id, s, f), undefined);
  // React resets uncontrolled fields after every action, so a failed save re-renders with what was typed.
  const v = (k: string, fallback: string | number) => state?.values?.[k] ?? String(fallback);
  const chk = (k: string, fallback: boolean) => (state?.values ? state.values[k] === "on" : fallback);
  const input = "w-full border border-stone-400 bg-white px-3 py-2";
  const label = "block text-sm";
  return (
    <form action={action} className="grid max-w-2xl gap-4">
      <label className={label}>Name<input name="name" required defaultValue={v("name", initial.name)} className={input} /></label>
      <label className={label}>Slug (web address)<input name="slug" required defaultValue={v("slug", initial.slug)} className={input} placeholder="stoneware-mug" /></label>
      <label className={label}>Category
        <select name="categoryId" defaultValue={v("categoryId", initial.categoryId)} className={input}>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      <label className={label}>Description<textarea name="description" required rows={4} defaultValue={v("description", initial.description)} className={input} /></label>
      <div className="grid grid-cols-3 gap-4">
        <label className={label}>Price (₹)<input name="price" required inputMode="decimal" defaultValue={v("price", initial.price)} className={input} /></label>
        <label className={label}>Was (₹, optional)<input name="comparePrice" inputMode="decimal" defaultValue={v("comparePrice", initial.comparePrice)} className={input} /></label>
        <label className={label}>Stock<input name="stock" required inputMode="numeric" defaultValue={v("stock", initial.stock)} className={input} /></label>
      </div>
      <label className={label}>Glaze colours (hex, comma separated)<input name="colors" required defaultValue={v("colors", initial.colors)} className={input} placeholder="#c9795a, #8a9a7b" /></label>
      <label className={label}>Sizes (comma separated)<input name="sizes" required defaultValue={v("sizes", initial.sizes)} className={input} placeholder="Small 250 ml, Large 400 ml" /></label>
      <label className={label}>Photo (https link or /products/file.jpg, optional)<input name="imageUrl" defaultValue={v("imageUrl", initial.imageUrl)} className={input} /></label>
      <label className={label}>Placeholder colour or gradient (used when there is no photo)<input name="tone" defaultValue={v("tone", initial.tone)} className={input} /></label>
      <div className="flex flex-wrap gap-6 text-sm">
        <label><input type="checkbox" name="active" defaultChecked={chk("active", initial.active)} /> Visible in shop</label>
        <label><input type="checkbox" name="featured" defaultChecked={chk("featured", initial.featured)} /> Featured on home page</label>
        <label><input type="checkbox" name="isNew" defaultChecked={chk("isNew", initial.isNew)} /> Mark as new</label>
      </div>
      {state?.error && <p role="alert" className="text-rose-600">{state.error}</p>}
      <button disabled={pending} className="w-fit bg-brand px-6 py-2.5 text-white disabled:opacity-60">{pending ? "Saving…" : "Save product"}</button>
    </form>
  );
}
