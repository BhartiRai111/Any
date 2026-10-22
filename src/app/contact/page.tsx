import { ContactForm } from "@/components/contact-form";
import { storeEmail } from "@/lib/store";

export const metadata = { title: "Contact" };

export default function Contact() {
  return (
    <div className="mx-auto grid max-w-4xl gap-10 py-6 md:grid-cols-2">
      <div className="space-y-4">
        <h1 className="font-serif text-5xl italic">Contact</h1>
        <p>Questions about an order, a custom piece or wholesale? Write to us and we will reply within 2 working days.</p>
        <p>Email: <span className="select-all font-medium">{storeEmail()}</span></p>
        <p className="text-stone-600">Studio hours: Monday to Friday, 10:00 to 17:00. The studio is not open to visitors.</p>
      </div>
      <ContactForm />
    </div>
  );
}
