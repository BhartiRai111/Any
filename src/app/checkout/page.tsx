import { CheckoutForm } from "@/components/checkout-form";
import { currentUser } from "@/lib/session";

export const metadata = { title: "Checkout" };

export default async function Checkout() {
  const user = await currentUser();
  return <CheckoutForm defaults={{ name: user?.name ?? "", email: user?.email ?? "" }} />;
}
