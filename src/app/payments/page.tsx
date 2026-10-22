import { PAYMENT_METHODS, bankLines } from "@/lib/store";
import { FREE_SHIPPING_OVER, SHIPPING_CENTS } from "@/lib/shipping";
import { money } from "@/lib/format";

export const metadata = { title: "Payment options" };

export default function Payments() {
  const bank = bankLines().length > 0;
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-6">
      <h1 className="font-serif text-5xl italic">Payment options</h1>
      <ul className="space-y-4">
        <li className="border border-stone-400 bg-white p-4">
          <p className="text-lg font-medium">{PAYMENT_METHODS.COD}</p>
          <p className="mt-1 text-sm">Pay the courier in cash when your parcel arrives. Choose it at checkout, no payment details needed.</p>
        </li>
        <li className="border border-stone-400 bg-white p-4">
          <p className="text-lg font-medium">{PAYMENT_METHODS.BANK_TRANSFER}</p>
          <p className="mt-1 text-sm">
            {bank
              ? "After you place the order we show our bank details. Transfer the total with your order number as the reference and we ship once it arrives."
              : "Not available at the moment."}
          </p>
        </li>
        <li className="border border-dashed border-stone-500 p-4">
          <p className="text-lg font-medium">Cards and wallets</p>
          <p className="mt-1 text-sm">Online card payment is coming soon.</p>
        </li>
      </ul>
      <p className="text-sm text-stone-700">
        Shipping is {money(SHIPPING_CENTS)}, and free on orders over {money(FREE_SHIPPING_OVER)}. Prices include all taxes.
      </p>
    </div>
  );
}
