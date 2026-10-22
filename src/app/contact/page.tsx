import { ContactForm } from "@/components/contact-form";
import { FiClock, FiMail } from "react-icons/fi";
import { storeEmail } from "@/lib/store";

export const metadata = { title: "Contact" };

export default function Contact() {
  return (
    <div className="mx-auto grid max-w-4xl gap-10 py-6 md:grid-cols-2">
      <div className="space-y-4">
        <h1 className="font-serif text-5xl italic">Contact</h1>
        <p>Questions about an order, a custom piece or wholesale? Write to us and we will reply within 2 working days.</p>
        <p className="flex items-center gap-2"><FiMail className="text-brand" aria-hidden="true" /> <span className="select-all font-medium">{storeEmail()}</span></p>
        <p className="flex items-start gap-2 text-stone-600"><FiClock className="mt-1 shrink-0 text-brand" aria-hidden="true" /> Studio hours: Monday to Friday, 10:00 to 17:00. The studio is not open to visitors.</p>
      </div>
      <ContactForm />
    </div>
  );
}
