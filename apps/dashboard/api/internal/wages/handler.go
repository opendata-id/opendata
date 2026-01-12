package wages

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
	page, _ := strconv.Atoi(c.Query("page", "1"))
	perPage, _ := strconv.Atoi(c.Query("per_page", "20"))

	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	params := ListParams{
		Province:  c.Query("province"),
		Search:    c.Query("search"),
		SortBy:    c.Query("sort_by", "umr"),
		SortOrder: c.Query("sort_order", "desc"),
		Page:      page,
		PerPage:   perPage,
	}

	wages, total, err := h.repo.List(params)
	if err != nil {
		return response.InternalError(c, "failed to get wages")
	}

	if wages == nil {
		wages = []Wage{}
	}

	return response.OKWithMeta(c, wages, response.Meta{
		Total:   total,
		Page:    page,
		PerPage: perPage,
	})
}

func (h *Handler) GetByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return response.BadRequest(c, "invalid id")
	}

	wage, err := h.repo.GetByID(id)
	if err != nil {
		return response.InternalError(c, "failed to get wage")
	}
	if wage == nil {
		return response.NotFound(c, "wage not found")
	}

	return response.OK(c, wage)
}
