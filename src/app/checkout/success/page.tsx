import Link from "next/link";
import { ClearCart } from "@/components/clear-cart";
import { bankLines } from "@/lib/store";
import { db } from "@/lib/db";

export const metadata = { title: "Order placed" };

export default async function Success({ searchParams }: PageProps<"/checkout/success">) {
  const sp = await searchParams;
  const id = typeof sp.order === "string" ? sp.order : "";
  const paid = sp.pay === "ONLINE" && id ? (await db.order.findUnique({ where: { id: Number(id) || 0 }, select: { paymentStatus: true } }))?.paymentStatus : undefined;
  const bank = sp.pay === "BANK_TRANSFER" ? bankLines() : [];
  return (
    <div className="py-20 text-center">
      <ClearCart />
      <h1 className="font-serif text-4xl">Thank you!</h1>
      <p className="mt-3 text-stone-600">Your order {id && `#${id}`} has been placed.</p>
      {sp.pay === "ONLINE" && (
        <p className="mt-2 font-medium">{paid === "PAID" ? "Payment received." : "We are confirming your payment. This page will not charge you twice."}</p>
      )}
      {bank.length > 0 && (
        <div className="mx-auto mt-6 max-w-sm border border-dashed border-stone-500 bg-white p-4 text-left text-sm">
          <p className="font-medium">Pay by bank transfer</p>
          {bank.map((l) => <p key={l}>{l}</p>)}
          <p className="mt-2">Reference: order {id}. We ship once the payment arrives.</p>
        </div>
      )}
      <Link href="/shop" className="mt-8 inline-block rounded-sm bg-stone-900 px-8 py-3 text-white">Keep shopping</Link>
    </div>
  );
}
