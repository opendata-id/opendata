package regions

type Region struct {
	ID       int      `json:"id"`
	Code     string   `json:"code"`
	Name     string   `json:"name"`
	Province string   `json:"province"`
	Type     string   `json:"type"`
	Lat      *float64 `json:"lat,omitempty"`
	Lng      *float64 `json:"lng,omitempty"`
}

type RegionDetail struct {
	Region
	Wage *float64 `json:"wage,omitempty"`
	Year *int     `json:"year,omitempty"`
}

type ListParams struct {
	Province string
	Type     string
	Search   string
}

type ProvinceGroup struct {
	Province string   `json:"province"`
	Count    int      `json:"count"`
	Regions  []Region `json:"regions,omitempty"`
}
