import {
  cancelOrderForUser,
  createOrder as createOrderService,
  getGuestOrderForLookup,
  getOrderForUser,
  getOrdersForUser,
} from "../services/order.service.js";
import { validateGuestOrderLookup } from "../validators/order.validator.js";

function sendError(res, error) {
  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Không thể xử lý đơn hàng lúc này."
        : error.message,
  });
}

export async function createOrder(req, res) {
  try {
    const order = await createOrderService(
      req.validatedOrder,
      req.user?._id ?? null,
      req.idempotencyKey
    );
    const orderData = order.toObject ? order.toObject() : { ...order };
    delete orderData.idempotencyKey;

    return res.status(201).json({
      success: true,
      data: orderData,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getMyOrders(req, res) {
  try {
    const orders = await getOrdersForUser(req.user._id);

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getMyOrder(req, res) {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy đơn hàng.",
    });
  }

  try {
    const order = await getOrderForUser(req.params.id, req.user._id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng.",
      });
    }

    return res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function cancelMyOrder(req, res) {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy đơn hàng.",
    });
  }

  try {
    const order = await cancelOrderForUser(req.params.id, req.user._id);

    return res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function lookupGuestOrder(req, res) {
  const validation = validateGuestOrderLookup(req.body || {});

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.message,
    });
  }

  try {
    const order = await getGuestOrderForLookup(
      validation.value.orderId,
      validation.value.phone
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng phù hợp với mã đơn và số điện thoại.",
      });
    }

    return res.json({ success: true, data: order });
  } catch (error) {
    return sendError(res, error);
  }
}
