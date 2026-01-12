import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useInflation(year?: number) {
  return useQuery({
    queryKey: ['inflation', year],
    queryFn: () => api.getInflation(year),
    staleTime: 60 * 1000,
  });
}
