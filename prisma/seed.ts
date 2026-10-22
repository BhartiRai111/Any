import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const categories = [
  { slug: "mugs-cups", name: "Mugs & cups" },
  { slug: "planters", name: "Planters" },
  { slug: "candles", name: "Candles" },
  { slug: "tableware", name: "Tableware" },
];

const mugSizes = ["Small 250 ml", "Large 400 ml"];
const planterSizes = ["Small 10 cm", "Medium 15 cm", "Large 22 cm"];
const candleSizes = ["Travel tin 120 g", "Jar 250 g"];
const oneSize = ["One size"];

const g = (a: string, b: string) => `linear-gradient(135deg, ${a}, ${b})`;

const products = [
  { slug: "stoneware-mug", name: "Stoneware Mug", cat: "mugs-cups", price: 59900, colors: ["#c9795a", "#8a9a7b", "#e3cfa8"], sizes: mugSizes, tone: g("#e4b184", "#b4653a"), featured: true, isNew: true, description: "Thrown on the wheel in speckled stoneware with a thick, comfortable handle. Dishwasher and microwave safe." },
  { slug: "espresso-cup-pair", name: "Espresso Cup Pair", cat: "mugs-cups", price: 79900, colors: ["#2b2118", "#e3cfa8"], sizes: oneSize, tone: g("#d9c7a6", "#6b5238"), featured: true, description: "Two small cups with a matte outside and a glossy glaze inside. Holds 80 ml." },
  { slug: "handleless-tumbler", name: "Handleless Tumbler", cat: "mugs-cups", price: 39900, was: 49900, colors: ["#8a9a7b", "#c9795a"], sizes: oneSize, tone: g("#cbd5bd", "#8a9a7b"), description: "A pinched-rim tumbler for water, wine or tea. Each one has its own fingerprints." },
  { slug: "fern-planter", name: "Fern Planter", cat: "planters", price: 79900, colors: ["#8a9a7b", "#e3cfa8", "#c9795a"], sizes: planterSizes, tone: g("#b9c6a9", "#6f7f60"), featured: true, isNew: true, description: "A rounded planter with a drainage hole and a matching saucer. Fired to stoneware hardness for outdoor use." },
  { slug: "hanging-pot", name: "Hanging Pot", cat: "planters", price: 89900, colors: ["#e3cfa8", "#2b2118"], sizes: ["Medium 15 cm"], tone: g("#eadcbf", "#b79d6e"), description: "Hung from three cotton cords. Comes with a hook and a drip saucer." },
  { slug: "cactus-bowl", name: "Cactus Bowl", cat: "planters", price: 49900, colors: ["#c9795a", "#e3cfa8"], sizes: ["Small 10 cm", "Medium 15 cm"], tone: g("#e8c3a8", "#c9795a"), featured: true, description: "A shallow, wide bowl made for succulents. Unglazed outside, glazed inside." },
  { slug: "beeswax-candle", name: "Beeswax Candle", cat: "candles", price: 44900, colors: ["#e8c26a", "#e3cfa8"], sizes: candleSizes, tone: g("#f3e1a6", "#d9a93f"), featured: true, description: "Poured by hand from local beeswax with a cotton wick. Burns for up to 40 hours and smells faintly of honey." },
  { slug: "cedar-soy-candle", name: "Cedar & Soy Candle", cat: "candles", price: 54900, colors: ["#8a6d4a"], sizes: candleSizes, tone: g("#d6b997", "#8a6d4a"), isNew: true, description: "Soy wax scented with cedar and a little black pepper, poured into a reusable stoneware jar." },
  { slug: "taper-candle-set", name: "Taper Candle Set", cat: "candles", price: 34900, was: 44900, colors: ["#e3cfa8", "#7a2e1b"], sizes: ["Set of 4"], tone: g("#f0dfc0", "#a35a3a"), description: "Four hand-dipped beeswax tapers, 25 cm tall." },
  { slug: "dinner-plate", name: "Dinner Plate", cat: "tableware", price: 69900, colors: ["#e3cfa8", "#8a9a7b", "#2b2118"], sizes: ["27 cm"], tone: g("#efe3c9", "#b9a47a"), featured: true, description: "A wide plate with a slightly uneven rim. Food safe glaze, dishwasher safe." },
  { slug: "serving-bowl", name: "Serving Bowl", cat: "tableware", price: 109900, colors: ["#c9795a", "#e3cfa8"], sizes: ["28 cm"], tone: g("#e6bfa3", "#a8553a"), description: "A deep bowl for salads and pasta. Holds about 2 litres." },
  { slug: "butter-dish", name: "Butter Dish", cat: "tableware", price: 64900, colors: ["#8a9a7b", "#e3cfa8"], sizes: oneSize, tone: g("#d3dbc7", "#8a9a7b"), isNew: true, description: "A lidded dish with a ridge that keeps the lid from sliding. Fits a 250 g block." },
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
