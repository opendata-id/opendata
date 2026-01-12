package prices

import (
	"github.com/gofiber/fiber/v2"
	"github.com/syahril/opendata/apps/dashboard/api/pkg/response"
)

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{repo: repo}
}

func (h *Handler) List(c *fiber.Ctx) error {
	params := ListParams{
		MarketType: c.Query("market_type"),
		RegionType: c.Query("region_type"),
		Search:     c.Query("search"),
	}

	prices, err := h.repo.List(params)
	if err != nil {
		return response.InternalError(c, "failed to get prices")
	}

	if prices == nil {
		prices = []Price{}
	}

	return response.OKWithMeta(c, prices, response.Meta{
		Total: len(prices),
	})
}
