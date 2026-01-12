package prices

import (
	"database/sql"
	"fmt"
	"strings"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) List(params ListParams) ([]Price, error) {
	var conditions []string
	var args []any
	argIdx := 1

	if params.MarketType != "" {
		conditions = append(conditions, fmt.Sprintf("market_type = $%d", argIdx))
		args = append(args, params.MarketType)
		argIdx++
	}

	if params.RegionType != "" {
		conditions = append(conditions, fmt.Sprintf("region_type = $%d", argIdx))
		args = append(args, params.RegionType)
		argIdx++
	}

	if params.Search != "" {
		conditions = append(conditions, fmt.Sprintf("commodity ILIKE $%d", argIdx))
		args = append(args, "%"+params.Search+"%")
		argIdx++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	query := fmt.Sprintf(`
		SELECT id, commodity, CAST(price AS DOUBLE), unit,
			COALESCE(market_type, '') as market_type,
			COALESCE(region_type, '') as region_type,
			COALESCE(province, '') as province,
			date
		FROM grocery_prices
		%s
		ORDER BY commodity
	`, whereClause)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var prices []Price
	for rows.Next() {
		var p Price
		if err := rows.Scan(&p.ID, &p.Commodity, &p.Price, &p.Unit, &p.MarketType, &p.RegionType, &p.Province, &p.Date); err != nil {
			return nil, err
		}
		prices = append(prices, p)
	}

	return prices, nil
}
