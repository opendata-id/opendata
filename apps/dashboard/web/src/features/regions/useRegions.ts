import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ProvinceGroupResponse, RegionResponse } from '@/lib/api';

export function useRegions(params: { province?: string; type?: string; search?: string } = {}) {
  return useQuery({
    queryKey: ['regions', params],
    queryFn: () => api.getRegions(params) as Promise<{ data: RegionResponse[]; meta?: { total: number } }>,
    staleTime: 60 * 1000,
  });
}

export function useProvinces() {
  return useQuery({
    queryKey: ['provinces'],
    queryFn: () => api.getProvinces() as Promise<{ data: ProvinceGroupResponse[]; meta?: { total: number } }>,
    staleTime: 5 * 60 * 1000,
  });
}
