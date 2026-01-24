import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { WagesParams } from '@/lib/api';

export function useWages(params: WagesParams = {}) {
  return useQuery({
    queryKey: ['wages', params],
    queryFn: () => api.getWages(params),
    staleTime: 60 * 1000,
  });
}

export function useTopWages(limit = 5) {
  return useQuery({
    queryKey: ['wages', 'top', limit],
    queryFn: () => api.getWages({ sort_by: 'umr', sort_order: 'desc', per_page: limit }),
    staleTime: 60 * 1000,
  });
}
