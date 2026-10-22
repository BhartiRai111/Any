import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { AddressForm } from "@/components/address-form";
import { deleteAddress, makeDefaultAddress } from "@/app/actions/address";

export const dynamic = "force-dynamic";
export const metadata = { title: "My addresses" };

export default async function Addresses() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/account/addresses");
  const list = await db.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { id: "asc" }] });
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-5xl italic">Addresses</h1>
      {list.length === 0 ? <p>No saved addresses yet.</p> : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {list.map((a) => (
            <li key={a.id} className="border border-stone-400 bg-white p-4 text-sm">
              <p className="font-medium">{a.label} {a.isDefault && <span className="stamp !text-[10px]">default</span>}</p>
              <p className="mt-1">{a.name}<br />{a.address}<br />{a.city} {a.postalCode}, {a.country}</p>
              <div className="mt-3 flex gap-4">
                {!a.isDefault && <form action={makeDefaultAddress.bind(null, a.id)}><button className="underline">make default</button></form>}
                <form action={deleteAddress.bind(null, a.id)}><button className="underline">delete</button></form>
              </div>
            </li>
          ))}
        </ul>
      )}
      <AddressForm />
    </div>
  );
}
