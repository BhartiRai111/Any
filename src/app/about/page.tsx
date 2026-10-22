export const metadata = { title: "Our story" };

export default function About() {
  return (
    <div className="mx-auto max-w-xl space-y-5 py-8">
      <h1 className="font-serif text-5xl italic">Our story</h1>
      <p>Willow &amp; Clay is a one-room studio. Every mug, planter and candle is thrown, poured or finished by hand in small batches, so no two pieces are exactly alike.</p>
      <p>Orders ship within 3 working days. If something arrives damaged, write to us and we will make you a new one.</p>
      <span className="stamp">Made by hand</span>
    </div>
  );
}
