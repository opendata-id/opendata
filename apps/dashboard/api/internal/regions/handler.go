package regions

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
	groupBy := c.Query("group_by")

	if groupBy == "province" {
		provinces, err := h.repo.ListProvinces()
		if err != nil {
			return response.InternalError(c, "failed to get provinces")
		}
		if provinces == nil {
			provinces = []ProvinceGroup{}
		}
		return response.OKWithMeta(c, provinces, response.Meta{
			Total: len(provinces),
		})
	}

	params := ListParams{
		Province: c.Query("province"),
		Type:     c.Query("type"),
		Search:   c.Query("search"),
	}

	regions, err := h.repo.List(params)
	if err != nil {
		return response.InternalError(c, "failed to get regions")
	}

	if regions == nil {
		regions = []Region{}
	}

	return response.OKWithMeta(c, regions, response.Meta{
		Total: len(regions),
	})
}

func (h *Handler) GetByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return response.BadRequest(c, "invalid id")
	}

	region, err := h.repo.GetByID(id)
	if err != nil {
		return response.InternalError(c, "failed to get region")
	}
	if region == nil {
		return response.NotFound(c, "region not found")
	}

	return response.OK(c, region)
}
