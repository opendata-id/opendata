package stats

type Stats struct {
	TotalRegions    int     `json:"total_regions"`
	TotalProvinces  int     `json:"total_provinces"`
	AvgWage         float64 `json:"avg_wage"`
	MinWage         float64 `json:"min_wage"`
	MaxWage         float64 `json:"max_wage"`
	LatestInflation float64 `json:"latest_inflation"`
	TotalPrices     int     `json:"total_prices"`
	WageYear        int     `json:"wage_year"`
}
