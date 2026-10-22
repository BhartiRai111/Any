import Link from "next/link";

export const metadata = { title: "About" };

export default function About() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-6">
      <h1 className="font-serif text-5xl italic">About Willow &amp; Clay</h1>
      <p>Willow &amp; Clay is a one-room studio. Every mug, planter and candle is thrown, poured or finished by hand in small batches, so no two pieces are exactly alike.</p>
      <h2 className="font-serif text-3xl italic">How we work</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Stoneware is thrown on the wheel, glazed and fired twice.</li>
        <li>Candles are poured in small batches from beeswax and soy.</li>
        <li>Orders ship within 3 working days. If something arrives damaged, we make you a new one.</li>
      </ul>
      <p className="flex flex-wrap items-center gap-5">
        <span className="stamp">Made by hand</span>
        <Link href="/contact" className="underline">Say hello</Link>
        <Link href="/careers" className="underline">Work with us</Link>
      </p>
    </div>
  );
}
