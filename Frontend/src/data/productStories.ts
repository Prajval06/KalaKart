import type { Product } from './products';
import type { Artisan } from './artisans';
import { calculatePlatformFee, calculateArtisanEarnings } from '../utils/shipping';

export interface CraftStep {
  step: number;
  labelHindi: string;
  labelEnglish: string;
  description: string;
  image: string;
}

export interface ProductStory {
  emotionalTitle: string;
  narrative: string;
  effortMetrics: {
    timeToMake: string;
    technique: string;
    generationsCrafted: string;
  };
  culturalTags: {
    origin: string;
    craftType: string;
    occasion: string;
  };
  craftSteps: CraftStep[];
  /** Base price breakdown — shipping is computed separately via utils/shipping.ts */
  pricingBreakdown: {
    artisanEarns: number;  // 90% of base price
    platformFee: number;   // 10% of base price (fixed)
  };
  artisanCity: string;
}

/* ─────────────────────────── craft step image banks ─────────────────────── */

const STEPS = {
  pottery: [
    {
      step: 1,
      labelHindi: 'मिट्टी का चयन',
      labelEnglish: 'Clay Selection',
      description: 'Pure clay is sourced from riverbeds and kneaded for hours to remove air pockets.',
      image: 'https://images.unsplash.com/photo-1668750373664-5afd08e573fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    },
    {
      step: 2,
      labelHindi: 'हाथ से आकार देना',
      labelEnglish: 'Hand-Shaping on Wheel',
      description: 'The artisan centres the clay on a spinning wheel and coaxes the form upward with wet hands.',
      image: 'https://images.unsplash.com/photo-1744893497803-4631294c3a31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    },
    {
      step: 3,
      labelHindi: 'धूप में सुखाना व रंगाई',
      labelEnglish: 'Sun-Drying & Painting',
      description: 'After sun-drying for 48 hours the piece is hand-painted with motifs using natural mineral colours.',
      image: 'https://images.unsplash.com/photo-1719139830243-766eb3837646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    },
    {
      step: 4,
      labelHindi: 'भट्टी में पकाना',
      labelEnglish: 'Kiln Firing',
      description: 'The piece enters a wood-fired kiln for up to 12 hours, locking in colour and strength forever.',
      image: 'https://images.unsplash.com/photo-1668750373664-5afd08e573fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    },
  ],
  textiles: [
    {
      step: 1,
      labelHindi: 'धागे की तैयारी',
      labelEnglish: 'Natural Fibre Prep',
      description: 'Raw cotton is cleaned, combed and spun into yarn by hand, sometimes using a traditional charkha.',
      image: 'https://images.unsplash.com/photo-1661932908422-aeb3c162bd51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    },
    {
      step: 2,
      labelHindi: 'रंग बनाना',
      labelEnglish: 'Natural Dye Preparation',
      description: 'Dyes are extracted from marigold, indigo and pomegranate rind — the same recipe used for centuries.',
      image: 'https://images.unsplash.com/photo-1632399161898-61c2b77548bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    },
    {
      step: 3,
      labelHindi: 'हाथ से छपाई',
      labelEnglish: 'Hand Block Printing',
      description: 'Each motif is pressed by a carved wooden block, one stamp at a time, aligned purely by eye and memory.',
      image: 'https://images.unsplash.com/photo-1632399161898-61c2b77548bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    },
    {
      step: 4,
      labelHindi: 'अंतिम सुखाई',
      labelEnglish: 'Final Drying & Finishing',
      description: 'The fabric is washed, stretched and left to dry in open air, giving it its characteristic soft drape.',
      image: 'https://images.unsplash.com/photo-1711777072644-22e219d6ac57?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    },
  ],
  jewelry: [
    {
      step: 1,
      labelHindi: 'धातु का चयन',
      labelEnglish: 'Metal Sourcing',
      description: 'Sterling silver or gold sheets are selected and tested for purity before any work begins.',
      image: 'https://images.unsplash.com/photo-1725446572865-61e02db0d159?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    },
    {
      step: 2,
      labelHindi: 'हाथ से गढ़ना',
      labelEnglish: 'Hand-Crafting the Frame',
      description: 'The metal is heated, beaten into shape with tiny hammers, and filed smooth over many hours.',
      image: 'https://images.unsplash.com/photo-1650726583448-dda0065f2f11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    },
    {
      step: 3,
      labelHindi: 'रत्न जड़ाई',
      labelEnglish: 'Gemstone Setting',
      description: 'Each stone is individually set by hand using wax and pressure — no adhesives, no shortcuts.',
      image: 'https://images.unsplash.com/photo-1732949749422-0b6366faad64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    },
    {
      step: 4,
      labelHindi: 'चमकाना',
      labelEnglish: 'Polishing & Finishing',
      description: 'The finished piece is polished by hand with muslin cloth until it catches every light in the room.',
      image: 'https://images.unsplash.com/photo-1650726583448-dda0065f2f11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    },
  ],
  paintings: [
    {
      step: 1,
      labelHindi: 'रंग पीसना',
      labelEnglish: 'Grinding Natural Pigments',
      description: 'Lapis lazuli, ochre and vermilion are ground on a stone slab into fine powders — no synthetic dyes.',
      image: 'https://images.unsplash.com/photo-1625207336348-1d1c31a6bd36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    },
    {
      step: 2,
      labelHindi: 'कैनवास तैयार करना',
      labelEnglish: 'Preparing the Canvas',
      description: 'Handmade paper or canvas is primed with layers of homemade gesso before the first line is drawn.',
      image: 'https://images.unsplash.com/photo-1728750752481-985bf8117d78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    },
    {
      step: 3,
      labelHindi: 'हाथ से चित्रण',
      labelEnglish: 'Freehand Painting',
      description: 'The design unfolds from memory and intuition — each stroke placed with a brush made from squirrel hair.',
      image: 'https://images.unsplash.com/photo-1728750752481-985bf8117d78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    },
    {
      step: 4,
      labelHindi: 'बारीक कलाकारी',
      labelEnglish: 'Fine Detailing',
      description: 'Gold leaf accents and micro-fine details are added last, bringing the composition to life.',
      image: 'https://images.unsplash.com/photo-1697697929710-64661b35dfe2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    },
  ],
  woodwork: [
    {
      step: 1,
      labelHindi: 'लकड़ी का चयन',
      labelEnglish: 'Wood Selection',
      description: 'Seasoned sheesham or teak logs are chosen and left to dry for weeks to prevent cracking.',
      image: 'https://images.unsplash.com/photo-1752297306048-85a80e0e9a62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    },
    {
      step: 2,
      labelHindi: 'खुरदुरी नक्काशी',
      labelEnglish: 'Rough Carving',
      description: 'The general form is shaped with large chisels — a physical dialogue between the tool and the grain.',
      image: 'https://images.unsplash.com/photo-1765446568898-8aed7f391949?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    },
    {
      step: 3,
      labelHindi: 'बारीक नक्काशी',
      labelEnglish: 'Fine Detail Carving',
      description: 'Smaller gouges trace intricate motifs inspired by temple architecture — done entirely by eye.',
      image: 'https://images.unsplash.com/photo-1765446568898-8aed7f391949?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    },
    {
      step: 4,
      labelHindi: 'रेगमाल और पॉलिश',
      labelEnglish: 'Sanding & Natural Oil Finish',
      description: 'Twelve grades of sandpaper are used before the piece is sealed with linseed oil — no varnish, no fakes.',
      image: 'https://images.unsplash.com/photo-1759738102266-bab1d130b557?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    },
  ],
  metalcraft: [
    {
      step: 1,
      labelHindi: 'धातु पिघलाना',
      labelEnglish: 'Metal Melting',
      description: 'Raw brass or copper is carefully measured and melted in a clay crucible over a charcoal furnace.',
      image: 'https://images.unsplash.com/photo-1652960018678-1f19799996c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    },
    {
      step: 2,
      labelHindi: 'हथौड़े से आकार देना',
      labelEnglish: 'Hammer-Shaping',
      description: 'Molten metal is poured into hand-made clay moulds or beaten on an anvil with rhythmic hammer strokes.',
      image: 'https://images.unsplash.com/photo-1613833684940-e15a515aa1fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    },
    {
      step: 3,
      labelHindi: 'नक्काशी और खुदाई',
      labelEnglish: 'Engraving & Detailing',
      description: 'Geometric and floral motifs are chiseled freehand — patterns memorised across generations.',
      image: 'https://images.unsplash.com/photo-1728024167417-959b5a868647?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    },
    {
      step: 4,
      labelHindi: 'चमकाना',
      labelEnglish: 'Hand Polishing',
      description: 'The piece is buffed by hand with tamarind paste and muslin to reveal its signature warm golden glow.',
      image: 'https://images.unsplash.com/photo-1652960018678-1f19799996c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    },
  ],
};

/* ────────────────────────── city lookup by artisan ──────────────────────── */
const ARTISAN_CITY: Record<string, string> = {
  '1': 'Khambhat, Gujarat',
  '2': 'Bagru, Rajasthan',
  '3': 'Jaipur, Rajasthan',
  '4': 'Pune, Maharashtra',
  '5': 'Mysuru, Karnataka',
  '6': 'Majuli, Assam',
  '7': 'Varanasi, Uttar Pradesh',
};

/* ────────────────────────── per-category story data ─────────────────────── */
function buildStory(product: Product, artisan: Artisan | null | undefined): ProductStory {
  const price = product.price;
  const platformFee  = calculatePlatformFee(price);
  const artisanEarns = calculateArtisanEarnings(price);
  const artisanCity = artisan ? (ARTISAN_CITY[artisan.id] ?? `${artisan.state}`) : product.state;
  const artisanName = artisan?.name ?? product.artisan;

  const category = product.category.toLowerCase();

  /* ── Pottery & Ceramics ── */
  if (category.includes('pottery') || category.includes('ceramic')) {
    return {
      emotionalTitle: `Crafted over 3 days using traditional मिट्टी techniques`,
      narrative: `Deep in the villages of Gujarat, the ancient art of pottery still breathes through the hands of artisans like ${artisanName}. The clay is sourced from local riverbeds, cleaned and kneaded until perfectly pliable. Each piece is shaped entirely by hand on a spinning wheel — no machines, no shortcuts. After sun-drying for two days, it enters a wood-fired kiln, then emerges to receive its hand-painted motifs. Every brush-stroke is placed by memory, every form shaped by decades of muscle. This is not mass production. This is memory, culture, and love — baked into form.`,
      effortMetrics: { timeToMake: '3–4 Days', technique: 'Traditional Wheel Throwing', generationsCrafted: '3rd Generation Artisan' },
      culturalTags: { origin: artisanCity, craftType: 'Terracotta / Blue Pottery', occasion: 'Diwali · Home Decor · Gifting' },
      craftSteps: STEPS.pottery,
      pricingBreakdown: { artisanEarns, platformFee },
      artisanCity,
    };
  }

  /* ── Textiles & Fabrics ── */
  if (category.includes('textile') || category.includes('fabric') || category.includes('weave')) {
    return {
      emotionalTitle: `A heritage block-print woven through 5 generations of प्रिंटिंग tradition`,
      narrative: `In Bagru village near Jaipur, the fragrance of natural dye fills the morning air. Artisans like ${artisanName} wake before sunrise to mix marigold, indigo and pomegranate — the same recipe her great-grandmother used. Each metre of fabric is pressed by hand, one carved wooden block at a time, aligned by eye and memory alone. A single saree can take five full days to complete. The pattern you see was not printed by machine — it was stamped by hands that have done this a thousand times, and still choose to do it again.`,
      effortMetrics: { timeToMake: '5–7 Days', technique: 'Hand Block Printing & Natural Dyeing', generationsCrafted: '5th Generation Artisan' },
      culturalTags: { origin: artisanCity, craftType: 'Block Printing / Handloom Weave', occasion: 'Weddings · Festive Wear · Everyday Use' },
      craftSteps: STEPS.textiles,
      pricingBreakdown: { artisanEarns, platformFee },
      artisanCity,
    };
  }

  /* ── Jewelry ── */
  if (category.includes('jewelry') || category.includes('jewellery')) {
    return {
      emotionalTitle: `Handset with precision over 2 days using the ancient Kundan technique`,
      narrative: `Kundan jewelry has adorned Indian royalty for over 2,500 years. In Jaipur's old city, ${artisanName} continues this legacy in a modest workshop where sunlight streams through latticed windows. Gold foil is painstakingly pressed around each gemstone — no adhesive, no machines — only wax, precision, and patience. The Meenakari enamel on the reverse takes equal time, each colour fired separately. What you hold is not simply jewelry. It is an heirloom — a wearable monument to a craft that refuses to be forgotten.`,
      effortMetrics: { timeToMake: '2–3 Days', technique: 'Kundan & Meenakari Setting', generationsCrafted: '4th Generation Artisan' },
      culturalTags: { origin: artisanCity, craftType: 'Kundan · Meenakari · Filigree', occasion: 'Weddings · Festive Occasions · Bridal' },
      craftSteps: STEPS.jewelry,
      pricingBreakdown: { artisanEarns, platformFee },
      artisanCity,
    };
  }

  /* ── Art & Paintings ── */
  if (category.includes('art') || category.includes('paint')) {
    return {
      emotionalTitle: `Painted over 4 days with natural pigments on handmade canvas`,
      narrative: `${artisanName} begins every painting by grinding her own colours — lapis lazuli for blue, ochre from local earth, vermilion from minerals. The canvas is prepared with layers of homemade gesso before a single line is drawn. The mandala emerges from the centre outward, drawn freehand, guided by geometry and meditation. Each dot placed with a pin-tipped tool, each line measured by breath rather than ruler. What emerges after four patient days is not just art — it is a record of hours given freely to beauty.`,
      effortMetrics: { timeToMake: '3–5 Days', technique: 'Natural Pigment Hand Painting', generationsCrafted: '2nd Generation Artist' },
      culturalTags: { origin: artisanCity, craftType: 'Madhubani · Mandala · Warli', occasion: 'Home Decor · Gifting · Meditation' },
      craftSteps: STEPS.paintings,
      pricingBreakdown: { artisanEarns, platformFee },
      artisanCity,
    };
  }

  /* ── Woodwork ── */
  if (category.includes('wood')) {
    return {
      emotionalTitle: `Carved over 10 days from sustainably sourced शीशम wood`,
      narrative: `${artisanName} learned to carve before he learned to write. In his family's workshop in Karnataka, sheesham logs are left to dry for weeks before a chisel touches them. The design is drawn entirely from memory — temple motifs, floral patterns, animals from ancient texts. Each cut is made slowly, deliberately, because wood does not forgive impatience. The final piece is sanded through twelve grades, then sealed with natural oils. Run your fingers across it — feel the tool marks. That texture is the signature of a craftsman who spent thirty years earning it.`,
      effortMetrics: { timeToMake: '7–12 Days', technique: 'Traditional Chiselled Wood Carving', generationsCrafted: '3rd Generation Craftsman' },
      culturalTags: { origin: artisanCity, craftType: 'Sheesham / Teak Wood Carving', occasion: 'Home Decor · Gifting · Traditional' },
      craftSteps: STEPS.woodwork,
      pricingBreakdown: { artisanEarns, platformFee },
      artisanCity,
    };
  }

  /* ── Metal Craft / default ── */
  return {
    emotionalTitle: `Hand-hammered over 2 days using 4,000-year-old Dhokra techniques`,
    narrative: `The Dhokra craft tradition is over 4,000 years old — one of the oldest non-ferrous metal casting processes in the world. ${artisanName} learned this art from his grandfather in Varanasi, working beside him in a workshop permanently warm with the glow of the furnace. Raw brass is melted and poured into clay moulds shaped entirely by hand. After cooling, each piece is chiseled for texture and detail, then polished to its characteristic warm glow. This piece carries the fingerprints of that work — and the weight of that history.`,
    effortMetrics: { timeToMake: '2–3 Days', technique: 'Dhokra / Lost-Wax Casting', generationsCrafted: '4th Generation Artisan' },
    culturalTags: { origin: artisanCity, craftType: 'Brass · Copper · Dhokra', occasion: 'Diwali · Religious Gifting · Home Decor' },
    craftSteps: STEPS.metalcraft,
    pricingBreakdown: { artisanEarns, platformFee },
    artisanCity,
  };
}

export function getProductStory(product: Product, artisan: Artisan | null | undefined): ProductStory {
  return buildStory(product, artisan);
}