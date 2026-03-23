import { useState, useEffect } from 'react';
import { Product } from './useProducts';

const BASE_URL = 'http://localhost:5000/api/v1';

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [recommended, setRecommended] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BASE_URL}/products/${id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Product not found');
        setProduct(json.data?.product ?? json.data);
        setRecommended(json.data?.recommended_product_ids || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  return { product, recommended, loading, error };
}
