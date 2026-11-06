import { validateOrderPayload } from "../validators/order.validator.js";

export function validateCreateOrder(req, res, next) {
  const result = validateOrderPayload(req.body);

  if (!result.valid) {
    return res.status(400).json({
      success: false,
      message: result.errors[0],
      errors: result.errors,
    });
  }

  req.validatedOrder = result.value;
  next();
}