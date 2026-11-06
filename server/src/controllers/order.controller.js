import { createOrder as createOrderService } from "../services/order.service.js";

export async function createOrder(req, res) {
  try {
    const order = await createOrderService(req.validatedOrder);

    return res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        statusCode === 500
          ? "Không thể tạo đơn hàng lúc này."
          : error.message,
    });
  }
}