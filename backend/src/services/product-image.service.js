'use strict';

const axios = require('axios');
const Product = require('../models/product.model');
require('../models/category.model');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildSearchQueries(product) {
  const name = String(product.name || '').trim();
  const category = String(product.categoryName || '').trim();
  const specialty = String(product.specialty || '').trim();
  const artisanName = String(product.artisanName || '').trim();

  const queries = [
    name,
    [name, category].filter(Boolean).join(' '),
    [name, specialty].filter(Boolean).join(' '),
    [name, artisanName].filter(Boolean).join(' '),
    [category, name].filter(Boolean).join(' '),
    [category, 'handmade'].filter(Boolean).join(' '),
    name,
  ].map((q) => q.trim()).filter(Boolean);

  return Array.from(new Set(queries));
}

function getProductImageKey(product) {
  const provider = String(product?.imageProvider || '').trim().toLowerCase();
  const providerId = String(product?.imageProviderId || '').trim();
  const imageUrl = String(product?.imageUrl || product?.image || '').trim();

  if (provider && providerId) {
    return `provider:${provider}:${providerId}`;
  }

  if (imageUrl) {
    return `url:${imageUrl}`;
  }

  return null;
}

function rememberImageKeys(usedKeys, candidate) {
  const imageUrl = String(candidate?.imageUrl || '').trim();
  const providerKey = candidate?.imageProvider && candidate?.imageProviderId
    ? `provider:${String(candidate.imageProvider).trim().toLowerCase()}:${String(candidate.imageProviderId).trim()}`
    : null;

  if (providerKey) {
    usedKeys.add(providerKey);
  }

  if (imageUrl) {
    usedKeys.add(`url:${imageUrl}`);
  }
}

function isImageAlreadyUsed(usedKeys, candidate) {
  const imageUrl = String(candidate?.imageUrl || '').trim();
  const providerKey = candidate?.imageProvider && candidate?.imageProviderId
    ? `provider:${String(candidate.imageProvider).trim().toLowerCase()}:${String(candidate.imageProviderId).trim()}`
    : null;

  return (providerKey && usedKeys.has(providerKey)) || (imageUrl && usedKeys.has(`url:${imageUrl}`));
}

function toRenderableUnsplashUrl(rawUrl) {
  if (!rawUrl) return null;
  const separator = rawUrl.includes('?') ? '&' : '?';
  return `${rawUrl}${separator}auto=format&fit=crop&w=600&h=600&q=80`;
}

async function fetchUnsplashImage(query, accessKey) {
  const response = await axios.get('https://api.unsplash.com/search/photos', {
    headers: {
      Authorization: `Client-ID ${accessKey}`,
      'Accept-Version': 'v1',
    },
    params: {
      query,
      per_page: 8,
      page: 1,
      orientation: 'squarish',
      content_filter: 'high',
    },
    timeout: 15000,
  });

  return (response?.data?.results || [])
    .map((item) => {
      const imageUrl = toRenderableUnsplashUrl(item.urls?.raw || item.urls?.regular || null);
      if (!imageUrl) return null;

      return {
        imageUrl,
        imageProvider: 'unsplash',
        imageProviderId: String(item.id),
        imageAttribution: {
          photographer: item.user?.name || null,
          photographerUsername: item.user?.username || null,
          photographerProfile: item.user?.links?.html || null,
          photoPage: item.links?.html || null,
        },
      };
    })
    .filter(Boolean);
}

async function fetchPexelsImage(query, apiKey) {
  const response = await axios.get('https://api.pexels.com/v1/search', {
    headers: { Authorization: apiKey },
    params: {
      query,
      per_page: 8,
      page: 1,
      orientation: 'square',
    },
    timeout: 15000,
  });

  return (response?.data?.photos || [])
    .map((item) => {
      const imageUrl = item.src?.large2x || item.src?.large || item.src?.medium || null;
      if (!imageUrl) return null;

      return {
        imageUrl,
        imageProvider: 'pexels',
        imageProviderId: String(item.id),
        imageAttribution: {
          photographer: item.photographer || null,
          photographerProfile: item.photographer_url || null,
          photoPage: item.url || null,
        },
      };
    })
    .filter(Boolean);
}

async function fetchPixabayImage(query, apiKey) {
  const response = await axios.get('https://pixabay.com/api/', {
    params: {
      key: apiKey,
      q: query,
      image_type: 'photo',
      per_page: 10,
      safesearch: 'true',
    },
    timeout: 15000,
  });

  return (response?.data?.hits || [])
    .map((item) => {
      const imageUrl = item.webformatURL || item.largeImageURL || null;
      if (!imageUrl) return null;

      return {
        imageUrl,
        imageProvider: 'pixabay',
        imageProviderId: String(item.id),
        imageAttribution: {
          photographer: item.user || null,
          photoPage: item.pageURL || null,
        },
      };
    })
    .filter(Boolean);
}

async function fetchProviderImageForQuery(provider, query) {
  if (provider === 'unsplash') {
    const key = process.env.UNSPLASH_ACCESS_KEY;
    if (!key) throw new Error('UNSPLASH_ACCESS_KEY is required');
    return fetchUnsplashImage(query, key);
  }

  if (provider === 'pexels') {
    const key = process.env.PEXELS_API_KEY;
    if (!key) throw new Error('PEXELS_API_KEY is required');
    return fetchPexelsImage(query, key);
  }

  if (provider === 'pixabay') {
    const key = process.env.PIXABAY_API_KEY;
    if (!key) throw new Error('PIXABAY_API_KEY is required');
    return fetchPixabayImage(query, key);
  }

  throw new Error(`Unsupported provider: ${provider}`);
}

function normalizeProviderOrder(provider, providerOrder) {
  const supportedProviders = ['unsplash', 'pexels', 'pixabay'];
  const requested = String(provider || '').toLowerCase();

  if (Array.isArray(providerOrder) && providerOrder.length > 0) {
    return Array.from(new Set(
      providerOrder
        .map((item) => String(item || '').toLowerCase().trim())
        .filter((item) => supportedProviders.includes(item))
    ));
  }

  if (supportedProviders.includes(requested)) {
    return [requested, ...supportedProviders.filter((item) => item !== requested)];
  }

  return supportedProviders;
}

async function resolveProviderImage(provider, product, providerOrder, usedKeys = new Set()) {
  const queries = buildSearchQueries(product);
  const providers = normalizeProviderOrder(provider, providerOrder);

  for (const currentProvider of providers) {
    for (const query of queries) {
      try {
        const results = await fetchProviderImageForQuery(currentProvider, query);
        for (const result of results || []) {
          if (!result?.imageUrl || isImageAlreadyUsed(usedKeys, result)) {
            continue;
          }

          return result;
        }
      } catch (error) {
        const status = error?.response?.status;
        if (status === 401 || status === 403 || status === 429) {
          break;
        }
      }
    }
  }

  return null;
}

async function refreshProductImages({
  provider = 'unsplash',
  providerOrder,
  limit = 100,
  overwrite = false,
  delayMs = 400,
} = {}) {
  const normalizedProvider = String(provider || 'unsplash').toLowerCase();
  const normalizedProviderOrder = normalizeProviderOrder(normalizedProvider, providerOrder);

  const products = await Product.find({ isAvailable: true })
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .limit(Math.max(1, Number(limit) || 100));

  const imageCounts = new Map();
  for (const product of products) {
    const key = getProductImageKey(product);
    if (!key) continue;
    imageCounts.set(key, (imageCounts.get(key) || 0) + 1);
  }

  const usedKeys = new Set();
  for (const product of products) {
    const key = getProductImageKey(product);
    if (!key) continue;
    usedKeys.add(key);
    const imageUrl = String(product.imageUrl || '').trim();
    if (imageUrl) {
      usedKeys.add(`url:${imageUrl}`);
    }
  }

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const product of products) {
    try {
      const currentKey = getProductImageKey(product);
      const shouldRefresh = overwrite || !currentKey || (imageCounts.get(currentKey) || 0) > 1;

      if (!shouldRefresh) {
        skipped += 1;
        continue;
      }

      const resolved = await resolveProviderImage(normalizedProvider, {
        name: product.name,
        categoryName: product.category?.name,
        specialty: product.specialty,
        artisanName: product.artisanName,
      }, normalizedProviderOrder, usedKeys);

      if (!resolved?.imageUrl) {
        skipped += 1;
        continue;
      }

      product.imageUrl = resolved.imageUrl;
      product.imageProvider = resolved.imageProvider;
      product.imageProviderId = resolved.imageProviderId;
      product.imageAttribution = resolved.imageAttribution;
      product.imageUpdatedAt = new Date();
      product.images = [resolved.imageUrl];

      await product.save();
      rememberImageKeys(usedKeys, resolved);
      updated += 1;
    } catch (error) {
      failed += 1;
      const status = error?.response?.status;

      if (status === 401 || status === 403 || status === 429) {
        break;
      }
    }

    await sleep(Math.max(0, Number(delayMs) || 0));
  }

  return {
    provider: normalizedProvider,
    providerOrder: normalizedProviderOrder,
    scanned: products.length,
    updated,
    skipped,
    failed,
  };
}

module.exports = {
  buildSearchQueries,
  normalizeProviderOrder,
  resolveProviderImage,
  refreshProductImages,
};
