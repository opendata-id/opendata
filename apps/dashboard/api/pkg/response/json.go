package response

import "github.com/gofiber/fiber/v2"

type Meta struct {
	Total   int `json:"total"`
	Page    int `json:"page,omitempty"`
	PerPage int `json:"per_page,omitempty"`
}

type Response struct {
	Data any   `json:"data"`
	Meta *Meta `json:"meta,omitempty"`
}

type ErrorResponse struct {
	Error ErrorDetail `json:"error"`
}

type ErrorDetail struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func OK(c *fiber.Ctx, data any) error {
	return c.JSON(Response{Data: data})
}

func OKWithMeta(c *fiber.Ctx, data any, meta Meta) error {
	return c.JSON(Response{Data: data, Meta: &meta})
}

func NotFound(c *fiber.Ctx, message string) error {
	return c.Status(fiber.StatusNotFound).JSON(ErrorResponse{
		Error: ErrorDetail{Code: "NOT_FOUND", Message: message},
	})
}

func BadRequest(c *fiber.Ctx, message string) error {
	return c.Status(fiber.StatusBadRequest).JSON(ErrorResponse{
		Error: ErrorDetail{Code: "BAD_REQUEST", Message: message},
	})
}

func InternalError(c *fiber.Ctx, message string) error {
	return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
		Error: ErrorDetail{Code: "INTERNAL_ERROR", Message: message},
	})
}
