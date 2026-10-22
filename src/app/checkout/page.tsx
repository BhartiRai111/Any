import { CheckoutForm } from "@/components/checkout-form";
import { currentUser } from "@/lib/session";
import { bankLines } from "@/lib/store";
import { razorpayEnabled } from "@/lib/razorpay";

export const metadata = { title: "Checkout" };

export default async function Checkout() {
  const user = await currentUser();
  return <CheckoutForm defaults={{ name: user?.name ?? "", email: user?.email ?? "" }} bankAvailable={bankLines().length > 0} onlineAvailable={razorpayEnabled()} />;
}
