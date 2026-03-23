import { useState, useEffect } from 'react';

const BASE_URL = 'http://localhost:5000/api/v1';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: { id: string; name: string } | string;
  artisanName: string;
  specialty: string;
  rating: number;
  numReviews: number;
  isAvailable: boolean;
  tags: string[];
}

interface ProductsMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages?: number;
}

interface UseProductsParams {
  page?: number;
  per_page?: number;
  category?: string;
  search?: string;
}

export function useProducts(params: UseProductsParams = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<ProductsMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams();
        if (params.page)     query.append('page',     String(params.page));
        if (params.per_page) query.append('per_page', String(params.per_page));
        if (params.category) query.append('category', params.category);
        if (params.search)   query.append('search',   params.search);
        const qs = query.toString();

        const res = await fetch(`${BASE_URL}/products${qs ? `?${qs}` : ''}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Failed to fetch products');

        setProducts(json.data?.products || []);
        setMeta(json.meta);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.per_page, params.category, params.search]);

  return { products, meta, loading, error };
}
