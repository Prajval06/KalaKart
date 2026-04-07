'use strict';

const fs = require('fs');
const path = require('path');

const CATALOG_PATH = path.resolve(__dirname, '../../data/kalakart_artisan_products.json');

const CATEGORY_MAP = {
  pottery: { name: 'Pottery & Ceramics', slug: 'pottery-ceramics', display_order: 1 },
  clothing: { name: 'Clothing', slug: 'clothing', display_order: 2 },
  'home decor': { name: 'Home Decor', slug: 'home-decor', display_order: 3 },
  'textile and fabrics': { name: 'Textiles & Fabrics', slug: 'textiles-fabrics', display_order: 4 },
  'textiles and fabrics': { name: 'Textiles & Fabrics', slug: 'textiles-fabrics', display_order: 4 },
  jewellery: { name: 'Jewelry', slug: 'jewelry', display_order: 5 },
  jewelry: { name: 'Jewelry', slug: 'jewelry', display_order: 5 },
  'art and paintings': { name: 'Art & Paintings', slug: 'art-paintings', display_order: 6 },
  'crafts and weaving': { name: 'Crafts & Weaving', slug: 'crafts-weaving', display_order: 7 },
};

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeCategory(rawCategory) {
  const key = String(rawCategory || '').trim().toLowerCase();
  if (CATEGORY_MAP[key]) return CATEGORY_MAP[key];
  const pretty = String(rawCategory || 'Uncategorized').trim();
  return { name: pretty, slug: slugify(pretty), display_order: 99 };
}

function loadCatalogEntries() {
  const raw = fs.readFileSync(CATALOG_PATH, 'utf8');
  return JSON.parse(raw);
}

function buildSeedData(entries) {
  const categoriesBySlug = new Map();

  const products = entries.map((entry) => {
    const normalizedCategory = normalizeCategory(entry.category);
    categoriesBySlug.set(normalizedCategory.slug, normalizedCategory);

    return {
      name: entry.product_name,
      slug: slugify(entry.product_name),
      description: entry.description,
      price: Number(entry.price || 0),
      stock: Number(entry.stock || 0),
      images: [entry.image_url].filter(Boolean),
      categorySlug: normalizedCategory.slug,
      categoryName: normalizedCategory.name,
      artisanName: entry.seller,
      specialty: entry.seller_specialty,
      rating: Number(entry.rating || 0),
      numReviews: 0,
      isAvailable: Number(entry.stock || 0) > 0,
      tags: [
        slugify(entry.category),
        slugify(entry.seller),
        slugify(entry.seller_specialty),
      ].filter(Boolean),
      dateListed: entry.date_listed ? new Date(entry.date_listed) : new Date(),
    };
  });

  const categories = Array.from(categoriesBySlug.values())
    .sort((a, b) => a.display_order - b.display_order)
    .map((category) => ({
      name: category.name,
      slug: category.slug,
      display_order: category.display_order,
      is_active: true,
    }));

  return { categories, products };
}

async function seedCatalog({ Category, Product, clearExisting = false }) {
  const catalogEntries = loadCatalogEntries();
  const { categories, products } = buildSeedData(catalogEntries);

  if (clearExisting) {
    await Category.deleteMany({});
    await Product.deleteMany({});
  }

  const categoryMap = new Map();
  for (const category of categories) {
    const existing = await Category.findOneAndUpdate(
      { slug: category.slug },
      category,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    categoryMap.set(category.slug, existing._id);
  }

  let upsertedCount = 0;
  for (const product of products) {
    const slug = product.slug || slugify(product.name);
    await Product.findOneAndUpdate(
      { slug },
      {
        name: product.name,
        slug,
        description: product.description,
        price: product.price,
        stock: product.stock,
        images: product.images,
        category: categoryMap.get(product.categorySlug),
        artisanName: product.artisanName,
        specialty: product.specialty,
        rating: product.rating,
        numReviews: product.numReviews,
        isAvailable: product.isAvailable,
        tags: product.tags,
        dateListed: product.dateListed,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    upsertedCount += 1;
  }

  return { categoriesCount: categories.length, productsCount: upsertedCount };
}

module.exports = {
  CATEGORY_MAP,
  loadCatalogEntries,
  buildSeedData,
  seedCatalog,
  normalizeCategory,
  slugify,
};