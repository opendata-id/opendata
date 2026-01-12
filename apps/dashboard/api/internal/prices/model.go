package prices

import "time"

type Price struct {
	ID         int       `json:"id"`
	Commodity  string    `json:"commodity"`
	Price      float64   `json:"price"`
	Unit       string    `json:"unit"`
	MarketType string    `json:"market_type,omitempty"`
	RegionType string    `json:"region_type,omitempty"`
	Province   string    `json:"province,omitempty"`
	Date       time.Time `json:"date"`
}

type ListParams struct {
	MarketType string
	RegionType string
	Search     string
}
