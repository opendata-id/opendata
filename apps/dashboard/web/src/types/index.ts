export interface Region {
  id: number;
  name: string;
  province: string;
  type: 'kabupaten' | 'kota' | 'provinsi';
}

export interface Wage {
  id: number;
  regionId: number;
  regionName: string;
  province: string;
  umr: number;
  year: number;
  change?: number;
}

export interface GroceryPrice {
  id: number;
  commodity: string;
  category: string;
  price: number;
  unit: string;
  date: string;
  change?: number;
  regionType: 'nasional' | 'provinsi' | 'kota';
}

export interface Inflation {
  month: string;
  year: number;
  headline: number;
  core: number;
  food: number;
  administered: number;
}

export interface StatSummary {
  label: string;
  value: string | number;
  subtext?: string;
  change?: number;
  trend?: number[];
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  count: number;
  lastUpdated: string;
  icon: string;
}
