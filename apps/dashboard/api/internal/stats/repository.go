package stats

import "database/sql"

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) GetStats() (*Stats, error) {
	var s Stats

	err := r.db.QueryRow(`
		SELECT
			(SELECT COUNT(*) FROM regions) as total_regions,
			(SELECT COUNT(DISTINCT province) FROM regions) as total_provinces,
			CAST((SELECT COALESCE(AVG(umr), 0) FROM wages) AS DOUBLE) as avg_wage,
			CAST((SELECT COALESCE(MIN(umr), 0) FROM wages) AS DOUBLE) as min_wage,
			CAST((SELECT COALESCE(MAX(umr), 0) FROM wages) AS DOUBLE) as max_wage,
			CAST((SELECT COALESCE(yoy, 0) FROM inflation ORDER BY year DESC, month DESC LIMIT 1) AS DOUBLE) as latest_inflation,
			(SELECT COUNT(*) FROM grocery_prices) as total_prices,
			(SELECT COALESCE(MAX(year), 2025) FROM wages) as wage_year
	`).Scan(
		&s.TotalRegions,
		&s.TotalProvinces,
		&s.AvgWage,
		&s.MinWage,
		&s.MaxWage,
		&s.LatestInflation,
		&s.TotalPrices,
		&s.WageYear,
	)
	if err != nil {
		return nil, err
	}

	return &s, nil
}
