/**
 * Shipping calculation utility — KalaKart
 *
 * Rules from pricing-logic.md:
 *  • Shipping is category-based (NOT fixed)
 *  • Adjusted by item weight proxy (price band) and delivery zone
 *  • Platform fee is ALWAYS 10% of base price, never included in shipping
 */



/** Base shipping midpoint per product category */
const CATEGORY_BASE: Record<string, number> = {
  'art':       100,   // Paintings / Wall Art  → ₹80–₹120
  'paint':     100,
  'jewelry':    55,   // Handmade Jewelry       → ₹40–₹70
  'jewel':      55,
  'textile':    80,   // Clothing / Textiles    → ₹60–₹100
  'fabric':     80,
  'weave':      80,
  'home':      100,   // Home Decor / Handicrafts → ₹70–₹130
  'decor':     100,
  'pottery':   110,   // Heavier / fragile — within Home Decor range
  'ceramic':   110,
  'wood':      110,   // Bulky, closer to upper Home Decor range
  'metal':      90,   // Metal Craft
  'leather':    80,
};

function getBaseShipping(category: string): number {
  const lower = category.toLowerCase();
  for (const [key, val] of Object.entries(CATEGORY_BASE)) {
    if (lower.includes(key)) return val;
  }
  return 90; // sensible default
}

/**
 * Weight adjustment: higher-priced items are generally heavier / bulkier.
 * Applied as a flat rupee surcharge on top of the base.
 */
function weightAdjustment(price: number): number {
  if (price < 500)  return 0;
  if (price < 2000) return 10;
  if (price < 5000) return 20;
  return 30;
}

/**
 * Final Shipping = base + weightAdj — rounded to ₹5
 */
export function calculateShipping(
  category: string,
  price:    number
): number {
  const raw = getBaseShipping(category) + weightAdjustment(price);
  return Math.round(raw / 5) * 5; // round to nearest ₹5 for clean display
}

/** Platform fee is always 10% of base price, rounded to the nearest rupee. */
export function calculatePlatformFee(price: number): number {
  return Math.round(price * 0.10);
}

/** Artisan earnings = base price − platform fee (always 90%). */
export function calculateArtisanEarnings(price: number): number {
  return price - calculatePlatformFee(price);
}
