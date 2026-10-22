"use client";

export function PrintButton() {
  return <button onClick={() => window.print()} className="no-print bg-stone-900 px-5 py-2 text-white">print or save as PDF</button>;
}
