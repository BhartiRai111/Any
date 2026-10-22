import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart";
import { Header } from "@/components/header";

const sans = Inter({ variable: "--font-inter", subsets: ["latin"] });
const serif = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "MAISON — Fashion boutique", template: "%s · MAISON" },
  description: "Modern essentials for women and men: clothing, shoes and bags.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="flex min-h-screen flex-col bg-white text-stone-900">
        <CartProvider>
          <Header />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
          <footer className="border-t border-stone-200 py-8 text-center text-sm text-stone-500">
            © {new Date().getFullYear()} MAISON. Demo store.
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
