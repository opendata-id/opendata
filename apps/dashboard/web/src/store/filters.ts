import { proxy } from 'valtio';

interface FilterState {
  search: string;
  province: string | null;
  year: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const filterState = proxy<FilterState>({
  search: '',
  province: null,
  year: 2025,
  sortBy: 'umr',
  sortOrder: 'desc',
});

export const setSearch = (search: string) => {
  filterState.search = search;
};

export const setProvince = (province: string | null) => {
  filterState.province = province;
};

export const setYear = (year: number) => {
  filterState.year = year;
};

export const setSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
  filterState.sortBy = sortBy;
  filterState.sortOrder = sortOrder;
};

export const toggleSortOrder = () => {
  filterState.sortOrder = filterState.sortOrder === 'asc' ? 'desc' : 'asc';
};

export const resetFilters = () => {
  filterState.search = '';
  filterState.province = null;
  filterState.year = 2025;
  filterState.sortBy = 'umr';
  filterState.sortOrder = 'desc';
};
