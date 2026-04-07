import { api } from '../lib/api';

export const productService = {
  async getProducts(params?: Record<string, any>) {
    const res = await api.get('/products', { params });
    return res.data; // { success, data: { products }, meta }
  },

  async getProductByIdentifier(identifier: string) {
    const safe = encodeURIComponent(identifier);
    const res = await api.get(`/products/${safe}`);
    return res.data; // { success, data: { product, recommended_product_ids } }
  },
};