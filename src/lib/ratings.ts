import "server-only";
import { db } from "./db";

export type Rating = { avg: number; count: number };

export async function getRatings(productIds: number[]): Promise<Map<number, Rating>> {
  if (productIds.length === 0) return new Map();
  const rows = await db.review.groupBy({ by: ["productId"], where: { productId: { in: productIds } }, _avg: { rating: true }, _count: { _all: true } });
  return new Map(rows.map((r) => [r.productId, { avg: r._avg.rating ?? 0, count: r._count._all }]));
}
