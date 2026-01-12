package inflation

type Inflation struct {
	ID    int     `json:"id"`
	Year  int     `json:"year"`
	Month int     `json:"month"`
	YoY   float64 `json:"yoy"`
	MtM   float64 `json:"mtm"`
}
