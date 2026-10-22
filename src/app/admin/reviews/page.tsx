import { db } from "@/lib/db";
import { Stars } from "@/components/stars";
import { deleteReview } from "@/app/actions/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Reviews" };

export default async function Reviews() {
  const reviews = await db.review.findMany({ include: { product: { select: { name: true } }, user: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div>
      <h1 className="font-serif text-4xl italic">Reviews</h1>
      {reviews.length === 0 ? <p className="mt-5">No reviews yet.</p> : (
        <ul className="mt-5 space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="border border-stone-400 bg-white p-4 text-sm">
              <p className="font-medium">{r.product.name} · <Stars value={r.rating} /> · {r.user.name} ({r.user.email})</p>
              <p className="mt-1">{r.body}</p>
              <form action={deleteReview.bind(null, r.id)} className="mt-2"><button className="underline">delete review</button></form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
