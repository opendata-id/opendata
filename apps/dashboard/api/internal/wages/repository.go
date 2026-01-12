package wages

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

func (r *Repository) List(params ListParams) ([]Wage, int, error) {
	var conditions []string
	var args []any
	argIdx := 1

	if params.Province != "" {
		conditions = append(conditions, fmt.Sprintf("r.province = $%d", argIdx))
		args = append(args, params.Province)
		argIdx++
	}

	if params.Search != "" {
		conditions = append(conditions, fmt.Sprintf("(r.name ILIKE $%d OR r.province ILIKE $%d)", argIdx, argIdx))
		args = append(args, "%"+params.Search+"%")
		argIdx++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	sortColumn := "w.umr"
	switch params.SortBy {
	case "name":
		sortColumn = "r.name"
	case "province":
		sortColumn = "r.province"
	case "umr":
		sortColumn = "w.umr"
	}

	sortOrder := "DESC"
	if params.SortOrder == "asc" {
		sortOrder = "ASC"
	}

	var total int
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM wages w
		JOIN regions r ON r.id = w.region_id
		%s
	`, whereClause)
	if err := r.db.QueryRow(countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	offset := (params.Page - 1) * params.PerPage
	query := fmt.Sprintf(`
		SELECT w.id, w.region_id, r.name, r.province, r.type, w.year, CAST(w.umr AS DOUBLE)
		FROM wages w
		JOIN regions r ON r.id = w.region_id
		%s
		ORDER BY %s %s
		LIMIT %d OFFSET %d
	`, whereClause, sortColumn, sortOrder, params.PerPage, offset)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var wages []Wage
	for rows.Next() {
		var w Wage
		if err := rows.Scan(&w.ID, &w.RegionID, &w.Region, &w.Province, &w.Type, &w.Year, &w.UMR); err != nil {
			return nil, 0, err
		}
		wages = append(wages, w)
	}

	return wages, total, nil
}

func (r *Repository) GetByID(id int) (*Wage, error) {
	var w Wage
	err := r.db.QueryRow(`
		SELECT w.id, w.region_id, r.name, r.province, r.type, w.year, CAST(w.umr AS DOUBLE)
		FROM wages w
		JOIN regions r ON r.id = w.region_id
		WHERE w.id = $1
	`, id).Scan(&w.ID, &w.RegionID, &w.Region, &w.Province, &w.Type, &w.Year, &w.UMR)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &w, nil
}
