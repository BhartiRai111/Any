import Link from "next/link";
import { storeEmail } from "@/lib/store";

export const metadata = { title: "Careers" };

// Edit this list when the studio is hiring.
const openings = [
  { title: "Studio assistant", type: "Part time", where: "On site", about: "Glaze, pack and ship orders, and help load the kiln. No experience needed, we will teach you." },
  { title: "Product photographer", type: "Freelance", where: "On site", about: "Shoot our pieces on a simple paper backdrop each month. A portfolio of product work is helpful." },
];

export default function Careers() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-6">
      <h1 className="font-serif text-5xl italic">Careers</h1>
      <p>We are a very small team that makes things by hand. When we grow, we hire people who care about doing careful work.</p>
      {openings.length === 0 ? (
        <p className="stamp">No open roles right now</p>
      ) : (
        <ul className="space-y-4">
          {openings.map((o) => (
            <li key={o.title} className="border border-stone-400 bg-white p-4">
              <p className="text-lg font-medium">{o.title}</p>
              <p className="text-xs uppercase tracking-wider text-stone-600">{o.type} · {o.where}</p>
              <p className="mt-2 text-sm">{o.about}</p>
            </li>
          ))}
        </ul>
      )}
      <p className="text-sm">
        To apply, send a short note and your work to <span className="select-all font-medium">{storeEmail()}</span> with the role in the subject,
        or use the <Link href="/contact" className="underline">contact form</Link>.
      </p>
    </div>
  );
}
