package inflation

import (
	"strconv"

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
	year, _ := strconv.Atoi(c.Query("year", "0"))

	items, err := h.repo.List(year)
	if err != nil {
		return response.InternalError(c, "failed to get inflation data")
	}

	if items == nil {
		items = []Inflation{}
	}

	return response.OKWithMeta(c, items, response.Meta{
		Total: len(items),
	})
}
