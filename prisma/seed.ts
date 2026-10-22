import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const categories = [
  { slug: "women", name: "Women" },
  { slug: "men", name: "Men" },
  { slug: "shoes", name: "Shoes" },
  { slug: "bags", name: "Bags" },
];

const clothingSizes = ["XS", "S", "M", "L", "XL"];
const shoeSizes = ["38", "39", "40", "41", "42", "43"];
const oneSize = ["One size"];

const g = (a: string, b: string) => `linear-gradient(135deg, ${a}, ${b})`;

const products = [
  { slug: "linen-wrap-dress", name: "Linen Wrap Dress", cat: "women", price: 8900, was: 11900, colors: ["#c46a4a", "#2f4f3e", "#e8dcc8"], sizes: clothingSizes, tone: g("#f3d3c3", "#c46a4a"), featured: true, isNew: true, description: "A breathable wrap dress in washed European linen with a flattering tie waist and relaxed sleeves." },
  { slug: "wool-blend-coat", name: "Wool Blend Coat", cat: "women", price: 19900, colors: ["#3b3b3b", "#a67c52"], sizes: clothingSizes, tone: g("#d9d4cc", "#6b5f52"), featured: true, description: "A tailored mid-length coat in a warm wool blend, fully lined with deep pockets." },
  { slug: "ribbed-knit-top", name: "Ribbed Knit Top", cat: "women", price: 3900, colors: ["#f2ede4", "#1e293b", "#9c6b7a"], sizes: clothingSizes, tone: g("#efe6da", "#b9a58c"), isNew: true, description: "A soft stretch rib that layers under everything and holds its shape wash after wash." },
  { slug: "high-rise-wide-jeans", name: "High-Rise Wide Jeans", cat: "women", price: 7500, colors: ["#3d5a80", "#111827"], sizes: clothingSizes, tone: g("#bcd0e6", "#3d5a80"), featured: true, description: "Rigid organic cotton denim with a high rise and a clean wide leg." },
  { slug: "oxford-shirt", name: "Classic Oxford Shirt", cat: "men", price: 6500, colors: ["#ffffff", "#9ec1de"], sizes: clothingSizes, tone: g("#e6eef6", "#9ec1de"), featured: true, description: "A crisp button-down in brushed Oxford cotton with a regular fit." },
  { slug: "merino-crew-sweater", name: "Merino Crew Sweater", cat: "men", price: 11900, was: 14900, colors: ["#27403a", "#8c8c8c", "#2b2d42"], sizes: clothingSizes, tone: g("#a8c3b6", "#27403a"), isNew: true, description: "Fine-gauge extra-fine merino that is warm without bulk. Machine washable." },
  { slug: "tapered-chinos", name: "Tapered Chinos", cat: "men", price: 7900, colors: ["#b9a27c", "#1f2937"], sizes: clothingSizes, tone: g("#e2d6bd", "#b9a27c"), description: "Stretch cotton twill chinos with a tapered leg you can dress up or down." },
  { slug: "quilted-bomber", name: "Quilted Bomber Jacket", cat: "men", price: 14900, colors: ["#1f2937", "#6b705c"], sizes: clothingSizes, tone: g("#9aa5b1", "#1f2937"), featured: true, description: "A light quilted bomber with a recycled fill, ribbed cuffs and a zip chest pocket." },
  { slug: "leather-sneakers", name: "Everyday Leather Sneakers", cat: "shoes", price: 12900, colors: ["#ffffff", "#111827"], sizes: shoeSizes, tone: g("#f5f5f4", "#a8a29e"), featured: true, isNew: true, description: "Minimal low-top sneakers in full-grain leather with a cushioned insole." },
  { slug: "suede-chelsea-boots", name: "Suede Chelsea Boots", cat: "shoes", price: 16900, colors: ["#8b5e3c", "#2b2b2b"], sizes: shoeSizes, tone: g("#d8b99a", "#8b5e3c"), description: "Soft suede Chelsea boots on a stacked heel with elastic side panels." },
  { slug: "strappy-sandals", name: "Strappy Leather Sandals", cat: "shoes", price: 8900, was: 10900, colors: ["#d6a77a", "#111827"], sizes: shoeSizes, tone: g("#f1dcc4", "#d6a77a"), description: "Hand-stitched leather sandals with an adjustable ankle strap." },
  { slug: "structured-tote", name: "Structured Tote", cat: "bags", price: 13900, colors: ["#7c4a2d", "#1f2937"], sizes: oneSize, tone: g("#d9b99b", "#7c4a2d"), featured: true, description: "A roomy structured tote with a zip top and an internal laptop sleeve." },
  { slug: "mini-crossbody", name: "Mini Crossbody Bag", cat: "bags", price: 6900, colors: ["#b91c1c", "#111827", "#e8dcc8"], sizes: oneSize, tone: g("#f4c7c3", "#b91c1c"), isNew: true, description: "Pocket-sized crossbody with an adjustable strap and magnetic closure." },
  { slug: "canvas-weekender", name: "Canvas Weekender", cat: "bags", price: 9900, colors: ["#6b705c", "#d4c5a9"], sizes: oneSize, tone: g("#d9dccb", "#6b705c"), description: "Waxed canvas duffle with leather handles and a separate shoe compartment." },
];

async function main() {
  for (const c of categories) {
    await db.category.upsert({ where: { slug: c.slug }, update: { name: c.name }, create: c });
  }
  const cats = Object.fromEntries((await db.category.findMany()).map((c) => [c.slug, c.id]));
  for (const p of products) {
    const data = {
      name: p.name,
      description: p.description,
      priceCents: p.price,
      comparePriceCents: p.was ?? null,
      colors: p.colors,
      sizes: p.sizes,
      tone: p.tone,
      featured: p.featured ?? false,
      isNew: p.isNew ?? false,
      categoryId: cats[p.cat],
    };
    await db.product.upsert({ where: { slug: p.slug }, update: data, create: { slug: p.slug, ...data } });
  }
  console.log(`Seeded ${categories.length} categories and ${products.length} products`);
}

main().finally(() => db.$disconnect());
