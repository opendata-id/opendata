package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"

	"github.com/syahril/opendata/apps/dashboard/api/internal/inflation"
	"github.com/syahril/opendata/apps/dashboard/api/internal/prices"
	"github.com/syahril/opendata/apps/dashboard/api/internal/regions"
	"github.com/syahril/opendata/apps/dashboard/api/internal/stats"
	"github.com/syahril/opendata/apps/dashboard/api/internal/wages"
	"github.com/syahril/opendata/apps/dashboard/api/pkg/database"
)

func main() {
	dbPath := os.Getenv("DUCKDB_PATH")
	if dbPath == "" {
		dbPath = "../../../data/duckdb/opendata.db"
	}

	db, err := database.Connect(dbPath)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer db.Close()

	app := fiber.New(fiber.Config{
		AppName: "OpenData Dashboard API",
	})

	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	api := app.Group("/api/v1")

	statsRepo := stats.NewRepository(db)
	statsHandler := stats.NewHandler(statsRepo)
	api.Get("/stats", statsHandler.GetStats)

	wagesRepo := wages.NewRepository(db)
	wagesHandler := wages.NewHandler(wagesRepo)
	api.Get("/wages", wagesHandler.List)
	api.Get("/wages/:id", wagesHandler.GetByID)

	pricesRepo := prices.NewRepository(db)
	pricesHandler := prices.NewHandler(pricesRepo)
	api.Get("/prices", pricesHandler.List)

	inflationRepo := inflation.NewRepository(db)
	inflationHandler := inflation.NewHandler(inflationRepo)
	api.Get("/inflation", inflationHandler.List)

	regionsRepo := regions.NewRepository(db)
	regionsHandler := regions.NewHandler(regionsRepo)
	api.Get("/regions", regionsHandler.List)
	api.Get("/regions/:id", regionsHandler.GetByID)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	log.Printf("Starting server on :%s", port)
	log.Fatal(app.Listen(":" + port))
}
