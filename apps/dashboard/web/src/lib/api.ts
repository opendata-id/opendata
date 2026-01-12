const API_BASE = import.meta.env.DEV ? 'http://localhost:8081' : 'https://api.opendata.id';

interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page?: number;
    per_page?: number;
  };
}

async function fetcher<T>(endpoint: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export interface StatsResponse {
  total_regions: number;
  total_provinces: number;
  avg_wage: number;
  min_wage: number;
  max_wage: number;
  latest_inflation: number;
  total_prices: number;
  wage_year: number;
}

export interface WageResponse {
  id: number;
  region_id: number;
  region: string;
  province: string;
  type: string;
  year: number;
  umr: number;
}

export interface PriceResponse {
  id: number;
  commodity: string;
  price: number;
  unit: string;
  market_type: string;
  region_type: string;
  province: string;
  date: string;
}

export interface InflationResponse {
  id: number;
  year: number;
  month: number;
  yoy: number;
  mtm: number;
}

export interface RegionResponse {
  id: number;
  code: string;
  name: string;
  province: string;
  type: string;
  lat?: number;
  lng?: number;
}

export interface ProvinceGroupResponse {
  province: string;
  count: number;
}

export interface WagesParams {
  province?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  per_page?: number;
}

export const api = {
  getStats: () => fetcher<StatsResponse>('/api/v1/stats'),

  getWages: (params: WagesParams = {}) => {
    const searchParams = new URLSearchParams();
    if (params.province) searchParams.set('province', params.province);
    if (params.search) searchParams.set('search', params.search);
    if (params.sort_by) searchParams.set('sort_by', params.sort_by);
    if (params.sort_order) searchParams.set('sort_order', params.sort_order);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.per_page) searchParams.set('per_page', String(params.per_page));
    const qs = searchParams.toString();
    return fetcher<WageResponse[]>(`/api/v1/wages${qs ? `?${qs}` : ''}`);
  },

  getWage: (id: number) => fetcher<WageResponse>(`/api/v1/wages/${id}`),

  getPrices: (params: { market_type?: string; search?: string } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.market_type) searchParams.set('market_type', params.market_type);
    if (params.search) searchParams.set('search', params.search);
    const qs = searchParams.toString();
    return fetcher<PriceResponse[]>(`/api/v1/prices${qs ? `?${qs}` : ''}`);
  },

  getInflation: (year?: number) => {
    const qs = year ? `?year=${year}` : '';
    return fetcher<InflationResponse[]>(`/api/v1/inflation${qs}`);
  },

  getRegions: (params: { province?: string; type?: string; search?: string; group_by?: string } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.province) searchParams.set('province', params.province);
    if (params.type) searchParams.set('type', params.type);
    if (params.search) searchParams.set('search', params.search);
    if (params.group_by) searchParams.set('group_by', params.group_by);
    const qs = searchParams.toString();
    return fetcher<RegionResponse[] | ProvinceGroupResponse[]>(`/api/v1/regions${qs ? `?${qs}` : ''}`);
  },

  getProvinces: () => fetcher<ProvinceGroupResponse[]>('/api/v1/regions?group_by=province'),
};
