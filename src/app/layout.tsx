import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart";
import { Header } from "@/components/header";

const mono = DM_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500"] });
const serif = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["400", "600"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: { default: "Willow & Clay — Handmade ceramics and candles", template: "%s · Willow & Clay" },
  description: "Small-batch ceramics, candles and home goods, made by hand in a one-room studio.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${mono.variable} ${serif.variable}`}>
      <body className="flex min-h-screen flex-col text-stone-900">
        <CartProvider>
          <Header />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
          <footer className="border-t border-stone-300 py-8 text-center text-sm text-stone-600">
            © {new Date().getFullYear()} Willow &amp; Clay. Demo store.
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
