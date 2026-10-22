"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartLine = {
  productId: number;
  slug: string;
  name: string;
  tone: string;
  size: string;
  color: string;
  unitCents: number;
  quantity: number;
};

type CartCtx = {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  add: (line: CartLine) => void;
  setQuantity: (productId: number, size: string, color: string, quantity: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "willow-clay-cart";

const same = (a: CartLine, id: number, size: string, color: string) =>
  a.productId === id && a.size === size && a.color === color;

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage after mount to avoid SSR mismatch
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, ready]);

  const value = useMemo<CartCtx>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotalCents: lines.reduce((n, l) => n + l.quantity * l.unitCents, 0),
      add: (line) =>
        setLines((prev) => {
          const hit = prev.find((l) => same(l, line.productId, line.size, line.color));
          if (!hit) return [...prev, line];
          return prev.map((l) => (l === hit ? { ...l, quantity: Math.min(l.quantity + line.quantity, 20) } : l));
        }),
      setQuantity: (id, size, color, quantity) =>
        setLines((prev) =>
          quantity <= 0
            ? prev.filter((l) => !same(l, id, size, color))
            : prev.map((l) => (same(l, id, size, color) ? { ...l, quantity: Math.min(quantity, 20) } : l)),
        ),
      clear: () => setLines([]),
    }),
    [lines],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
