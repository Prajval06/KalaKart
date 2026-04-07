import { useEffect } from 'react';
import { useNavigate } from 'react-router';

type Options = {
  error: string;
  notFoundMessage?: string;
  redirectTo?: string;
  delayMs?: number;
};

export function useAutoRedirectOnNotFound({
  error,
  notFoundMessage = 'Product not found',
  redirectTo = '/shop',
  delayMs = 2000,
}: Options) {
  const navigate = useNavigate();

  useEffect(() => {
    if (error === notFoundMessage) {
      const timer = setTimeout(() => navigate(redirectTo), delayMs);
      return () => clearTimeout(timer);
    }
  }, [error, notFoundMessage, redirectTo, delayMs, navigate]);

  return { isNotFound: error === notFoundMessage };
}