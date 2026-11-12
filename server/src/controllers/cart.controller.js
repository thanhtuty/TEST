import {
  getCustomerCart,
  mergeCustomerCart,
  replaceCustomerCart,
} from "../services/cart.service.js";
import { validateCartPayload } from "../validators/cart.validator.js";

function sendError(res, error) {
  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Không thể cập nhật giỏ hàng lúc này."
        : error.message,
  });
}

export async function getMyCart(req, res) {
  try {
    const items = await getCustomerCart(req.user._id);
    return res.json({ success: true, data: items });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function mergeMyCart(req, res) {
  const validation = validateCartPayload(req.body || {});

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.message,
    });
  }

  try {
    const items = await mergeCustomerCart(req.user._id, validation.value);
    return res.json({ success: true, data: items });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function updateMyCart(req, res) {
  const validation = validateCartPayload(req.body || {});

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.message,
    });
  }

  try {
    const items = await replaceCustomerCart(req.user._id, validation.value);
    return res.json({ success: true, data: items });
  } catch (error) {
    return sendError(res, error);
  }
}
