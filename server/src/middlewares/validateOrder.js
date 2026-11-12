import { validateOrderPayload } from "../validators/order.validator.js";

export function validateCreateOrder(req, res, next) {
  const idempotencyKey = req.get("Idempotency-Key") || "";
  if (!/^[a-z\d-]{36}$/i.test(idempotencyKey)) {
    return res.status(400).json({
      success: false,
      message: "Phiên đặt hàng không hợp lệ. Vui lòng tải lại trang và thử lại.",
    });
  }

  const result = validateOrderPayload(req.body);

  if (!result.valid) {
    return res.status(400).json({
      success: false,
      message: result.errors[0],
      errors: result.errors,
    });
  }

  req.validatedOrder = result.value;
  req.idempotencyKey = idempotencyKey;
  next();
}
