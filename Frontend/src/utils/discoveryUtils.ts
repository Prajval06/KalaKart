import { products, Product } from '../data/products';

export type StyleTag = 'minimal' | 'traditional' | 'festive' | 'eco';

export const getStyleScoresForProduct = (product: Product): Record<StyleTag, number> => {
  const scores: Record<StyleTag, number> = {
    minimal: 0,
    traditional: 0,
    festive: 0,
    eco: 0,
  };

  const textToSearch = `${product.name} ${product.description} ${product.category}`.toLowerCase();

  // Keyword mappings to styles
  if (textToSearch.includes('minimal') || textToSearch.includes('modern') || textToSearch.includes('simple') || textToSearch.includes('clean') || textToSearch.includes('neutral')) {
    scores.minimal += 2;
  }
  if (textToSearch.includes('traditional') || textToSearch.includes('classic') || textToSearch.includes('heritage') || textToSearch.includes('saree') || textToSearch.includes('kurta') || textToSearch.includes('mughal')) {
    scores.traditional += 2;
  }
  if (textToSearch.includes('festive') || textToSearch.includes('kundan') || textToSearch.includes('gold') || textToSearch.includes('jewelry') || textToSearch.includes('ornament') || textToSearch.includes('festival')) {
    scores.festive += 2;
  }
  if (textToSearch.includes('eco') || textToSearch.includes('terracotta') || textToSearch.includes('clay') || textToSearch.includes('bamboo') || textToSearch.includes('wood') || textToSearch.includes('natural') || textToSearch.includes('earth')) {
    scores.eco += 2;
  }

  // Category specific defaults
  if (product.category === 'Pottery & Ceramics' || product.category === 'Crafts & Weaving') {
    scores.eco += 1;
  }
  if (product.category === 'Jewelry') {
    scores.festive += 1;
  }
  if (product.category === 'Textiles & Fabrics') {
    scores.traditional += 1;
  }
  if (product.category === 'Art & Paintings' || product.category === 'Miniatures') {
    scores.traditional += 1;
  }

  // Fallback if no match
  if (Object.values(scores).every(score => score === 0)) {
    scores.traditional += 1; // Default to traditional as KalaKart is a handicrafts store
  }

  return scores;
};

export const getSuggestedProducts = (userScores: Record<StyleTag, number>, limit: number = 3): Product[] => {
  // Guard against all zero scores
  const allZeros = Object.values(userScores).every(score => score === 0);
  const effectiveUserScores = allZeros ? { ...userScores, traditional: 1 } : userScores;

  const scoredProducts = products.map(product => {
    const defaultScores = getStyleScoresForProduct(product);
    
    // Calculate a compatibility score (dot product)
    const compatibilityScore = effectiveUserScores.minimal * defaultScores.minimal +
                             effectiveUserScores.traditional * defaultScores.traditional +
                             effectiveUserScores.festive * defaultScores.festive + 
                             effectiveUserScores.eco * defaultScores.eco;
                             
    return {
      product,
      compatibilityScore,
    };
  });

  // Sort by compatibility score descending
  scoredProducts.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  
  return scoredProducts.slice(0, limit).map(sp => sp.product);
};

export const getStyleProfileDescription = (topStyle: StyleTag) => {
  switch (topStyle) {
    case 'minimal':
      return "You appreciate clean lines, simple forms, and modern elegance. We've curated pieces that bring a quiet, understated beauty to your space.";
    case 'traditional':
      return "You value heritage, classic motifs, and rich cultural history. Our selection highlights timeless craftsmanship that tells a story.";
    case 'festive':
      return "You love vibrant colors, intricate details, and joyful energy. These pieces are chosen to bring a celebratory feel to your surroundings.";
    case 'eco':
      return "You're drawn to earthy tones, sustainable materials, and natural textures. We've found handcrafted items that connect you to the earth.";
    default:
      return "We've curated these beautiful handcrafted items just for you.";
  }
};
