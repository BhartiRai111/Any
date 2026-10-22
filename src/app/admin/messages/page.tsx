import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Messages" };

export default async function Messages() {
  const messages = await db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div>
      <h1 className="font-serif text-4xl italic">Messages</h1>
      {messages.length === 0 ? <p className="mt-5">No messages yet.</p> : (
        <ul className="mt-5 space-y-4">
          {messages.map((m) => (
            <li key={m.id} className="border border-stone-400 bg-white p-4 text-sm">
              <p className="font-medium">{m.name} · <span className="select-all">{m.email}</span> · {m.createdAt.toLocaleString("en-US")}</p>
              <p className="mt-2 whitespace-pre-wrap">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
