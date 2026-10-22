import { CheckoutForm } from "@/components/checkout-form";
import { currentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { bankLines } from "@/lib/store";
import { razorpayEnabled } from "@/lib/razorpay";

export const metadata = { title: "Checkout" };

export default async function Checkout() {
  const user = await currentUser();
  const addresses = user ? await db.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { id: "asc" }] }) : [];
  return <CheckoutForm addresses={addresses.map((a) => ({ id: a.id, label: a.label, name: a.name, address: a.address, city: a.city, postalCode: a.postalCode, country: a.country }))} defaults={{ name: user?.name ?? "", email: user?.email ?? "" }} bankAvailable={bankLines().length > 0} onlineAvailable={razorpayEnabled()} />;
}
