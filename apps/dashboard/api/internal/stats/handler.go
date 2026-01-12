package stats

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

func (h *Handler) GetStats(c *fiber.Ctx) error {
	stats, err := h.repo.GetStats()
	if err != nil {
		return response.InternalError(c, err.Error())
	}
	return response.OK(c, stats)
}
