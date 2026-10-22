"use client";

import { useActionState } from "react";
import { submitReview } from "@/app/actions/reviews";

export function ReviewForm({ productId, slug, existing }: { productId: number; slug: string; existing?: { rating: number; body: string } }) {
  const [state, action, pending] = useActionState(submitReview.bind(null, productId, slug), undefined);
  return (
    <form action={action} className="mt-6 max-w-lg space-y-3 border border-stone-400 bg-white p-4">
      <p className="font-medium">{existing ? "Update your review" : "Write a review"}</p>
      <fieldset className="flex gap-3 text-sm">
        <legend className="sr-only">Rating</legend>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="flex items-center gap-1">
            <input type="radio" name="rating" value={n} defaultChecked={existing?.rating === n} required /> {n}★
          </label>
        ))}
      </fieldset>
      <textarea name="body" required rows={3} defaultValue={existing?.body} placeholder="What did you like?" aria-label="Review" className="w-full border border-stone-400 bg-white px-3 py-2" />
      {state?.error && <p role="alert" className="text-rose-600 text-sm">{state.error}</p>}
      {state?.done && <p role="status" className="text-sm">Thanks, your review is saved.</p>}
      <button disabled={pending} className="bg-stone-900 px-5 py-2 text-white disabled:opacity-60">{pending ? "Saving…" : "save review"}</button>
    </form>
  );
}
