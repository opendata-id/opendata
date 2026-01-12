package wages

type Wage struct {
	ID       int     `json:"id"`
	RegionID int     `json:"region_id"`
	Region   string  `json:"region"`
	Province string  `json:"province"`
	Type     string  `json:"type"`
	Year     int     `json:"year"`
	UMR      float64 `json:"umr"`
}

type ListParams struct {
	Province  string
	Search    string
	SortBy    string
	SortOrder string
	Page      int
	PerPage   int
}
