package regions

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

func (r *Repository) List(params ListParams) ([]Region, error) {
	var conditions []string
	var args []any
	argIdx := 1

	if params.Province != "" {
		conditions = append(conditions, fmt.Sprintf("province = $%d", argIdx))
		args = append(args, params.Province)
		argIdx++
	}

	if params.Type != "" {
		conditions = append(conditions, fmt.Sprintf("type = $%d", argIdx))
		args = append(args, params.Type)
		argIdx++
	}

	if params.Search != "" {
		conditions = append(conditions, fmt.Sprintf("(name ILIKE $%d OR province ILIKE $%d)", argIdx, argIdx))
		args = append(args, "%"+params.Search+"%")
		argIdx++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	query := fmt.Sprintf(`
		SELECT id, code, name, province, type, lat, lng
		FROM regions
		%s
		ORDER BY province, name
	`, whereClause)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var regions []Region
	for rows.Next() {
		var reg Region
		if err := rows.Scan(&reg.ID, &reg.Code, &reg.Name, &reg.Province, &reg.Type, &reg.Lat, &reg.Lng); err != nil {
			return nil, err
		}
		regions = append(regions, reg)
	}

	return regions, nil
}

func (r *Repository) GetByID(id int) (*RegionDetail, error) {
	var reg RegionDetail
	err := r.db.QueryRow(`
		SELECT r.id, r.code, r.name, r.province, r.type, r.lat, r.lng,
			CAST(w.umr AS DOUBLE), w.year
		FROM regions r
		LEFT JOIN wages w ON w.region_id = r.id
		WHERE r.id = $1
	`, id).Scan(
		&reg.ID, &reg.Code, &reg.Name, &reg.Province, &reg.Type, &reg.Lat, &reg.Lng,
		&reg.Wage, &reg.Year,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &reg, nil
}

func (r *Repository) ListProvinces() ([]ProvinceGroup, error) {
	rows, err := r.db.Query(`
		SELECT province, COUNT(*) as cnt
		FROM regions
		GROUP BY province
		ORDER BY province
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var provinces []ProvinceGroup
	for rows.Next() {
		var p ProvinceGroup
		if err := rows.Scan(&p.Province, &p.Count); err != nil {
			return nil, err
		}
		provinces = append(provinces, p)
	}

	return provinces, nil
}
