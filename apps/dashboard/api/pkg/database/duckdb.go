package database

import (
	"database/sql"

	"github.com/duckdb/duckdb-go/v2"
)

func Connect(path string) (*sql.DB, error) {
	connector, err := duckdb.NewConnector(path+"?access_mode=READ_ONLY", nil)
	if err != nil {
		return nil, err
	}

	db := sql.OpenDB(connector)
	if err := db.Ping(); err != nil {
		return nil, err
	}

	return db, nil
}
