import Link from "next/link";
import { ClearCart } from "@/components/clear-cart";

export const metadata = { title: "Order placed" };

export default async function Success({ searchParams }: PageProps<"/checkout/success">) {
  const sp = await searchParams;
  const id = typeof sp.order === "string" ? sp.order : "";
  return (
    <div className="py-20 text-center">
      <ClearCart />
      <h1 className="font-serif text-4xl">Thank you!</h1>
      <p className="mt-3 text-stone-600">Your order {id && `#${id}`} has been placed.</p>
      <Link href="/shop" className="mt-8 inline-block rounded-sm bg-stone-900 px-8 py-3 text-white">Keep shopping</Link>
    </div>
  );
}
