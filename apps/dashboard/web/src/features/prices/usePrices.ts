import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function usePrices(params: { market_type?: string; search?: string } = {}) {
  return useQuery({
    queryKey: ['prices', params],
    queryFn: () => api.getPrices(params),
    staleTime: 60 * 1000,
  });
}
