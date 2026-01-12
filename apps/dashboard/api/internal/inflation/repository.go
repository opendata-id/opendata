package inflation

import "database/sql"

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) List(year int) ([]Inflation, error) {
	query := `
		SELECT id, year, month, CAST(COALESCE(yoy, 0) AS DOUBLE), CAST(COALESCE(mtm, 0) AS DOUBLE)
		FROM inflation
		WHERE ($1 = 0 OR year = $1)
		ORDER BY year DESC, month DESC
	`

	rows, err := r.db.Query(query, year)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []Inflation
	for rows.Next() {
		var i Inflation
		if err := rows.Scan(&i.ID, &i.Year, &i.Month, &i.YoY, &i.MtM); err != nil {
			return nil, err
		}
		items = append(items, i)
	}

	return items, nil
}
