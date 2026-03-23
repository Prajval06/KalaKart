import { useState, useEffect } from 'react';

const BASE_URL = 'http://localhost:5000/api/v1';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${BASE_URL}/categories`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Failed to load categories');
        setCategories(json.data?.categories || json.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return { categories, loading, error };
}
