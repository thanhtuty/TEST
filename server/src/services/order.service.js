import Order from "../models/Order.js";
import Product from "../models/Product.js";

function createServiceError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function restoreStock(reservedProducts) {
  const results = await Promise.allSettled(
    reservedProducts.map(({ productId, quantity }) =>
      Product.updateOne(
        { _id: productId },
        { $inc: { stock: quantity } }
      )
    )
  );

  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error("Không thể hoàn lại tồn kho:", result.reason.message);
    }
  });
}

export async function createOrder(
  orderInput,
  userId = null,
  idempotencyKey = ""
) {
  const orderOwnerId = userId || null;

  if (idempotencyKey) {
    const existingOrder = await Order.findOne({
      idempotencyKey,
      user: orderOwnerId,
    });
    if (existingOrder) return existingOrder;
  }

  const reservedProducts = [];

  try {
    const orderItems = [];

    for (const item of orderInput.items) {
      const product = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          isActive: true,
          stock: { $gte: item.quantity },
        },
        { $inc: { stock: -item.quantity } },
        { new: true, runValidators: true }
      );

      if (!product) {
        throw createServiceError(
          409,
          "Sản phẩm không còn đủ hàng. Vui lòng cập nhật giỏ hàng."
        );
      }

      reservedProducts.push({
        productId: product._id,
        quantity: item.quantity,
      });
      const availableSizes = product.sizes || [];
      const availableColors = product.colors || [];

      if (
        (availableSizes.length &&
          (!item.size || !availableSizes.includes(item.size))) ||
        (!availableSizes.length && item.size)
      ) {
        throw createServiceError(409, "Kích thước vừa chọn không còn khả dụng.");
      }

      if (
        (availableColors.length &&
          (!item.color || !availableColors.includes(item.color))) ||
        (!availableColors.length && item.color)
      ) {
        throw createServiceError(409, "Màu sắc vừa chọn không còn khả dụng.");
      }
      orderItems.push({
        productId: product._id,
        name: product.name,
        image: product.images?.[0] || "",
        size: item.size,
        color: item.color,
        price: product.price,
        quantity: item.quantity,
        lineTotal: product.price * item.quantity,
      });
    }

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.lineTotal,
      0
    );

    return await Order.create({
      idempotencyKey,
      user: orderOwnerId,
      customer: orderInput.customer,
      items: orderItems,
      totalAmount,
      paymentMethod: "cod",
    });
  } catch (error) {
    if (reservedProducts.length > 0) {
      await restoreStock(reservedProducts);
    }

    if (idempotencyKey) {
      const existingOrder = await Order.findOne({
        idempotencyKey,
        user: orderOwnerId,
      });
      if (existingOrder) return existingOrder;
    }

    throw error;
  }
}

export async function getOrdersForUser(userId) {
  return Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();
}

export async function getOrderForUser(orderId, userId) {
  return Order.findOne({
    _id: orderId,
    user: userId,
  }).lean();
}

export async function getGuestOrderForLookup(orderId, phone) {
  const order = await Order.findOne({
    _id: orderId,
    user: null,
  })
    .select(
      "_id customer.fullName customer.phone items.name items.image items.size items.color items.price items.quantity items.lineTotal totalAmount paymentMethod status createdAt"
    )
    .lean();

  if (!order) return null;

  const normalizePhone = (value) => String(value || "").replace(/\D/g, "");

  if (normalizePhone(order.customer.phone) !== normalizePhone(phone)) {
    return null;
  }

  // Không trả số điện thoại, địa chỉ hoặc ghi chú giao hàng ra trang tra cứu.
  delete order.customer.phone;
  return order;
}

export async function cancelOrderForUser(orderId, userId) {
  // Chỉ yêu cầu đầu tiên chuyển được trạng thái mới được hoàn tồn kho.
  const order = await Order.findOneAndUpdate(
    {
      _id: orderId,
      user: userId,
      status: "pending",
    },
    { $set: { status: "cancelled" } },
    { new: true, runValidators: true }
  ).lean();

  if (!order) {
    const existingOrder = await Order.findOne({
      _id: orderId,
      user: userId,
    })
      .select("status")
      .lean();

    if (!existingOrder) {
      throw createServiceError(404, "Không tìm thấy đơn hàng.");
    }

    throw createServiceError(
      409,
      "Chỉ có thể hủy đơn hàng đang chờ xác nhận."
    );
  }

  // Gộp các dòng cùng sản phẩm vì một sản phẩm có thể có nhiều biến thể.
  const quantitiesByProduct = new Map();

  for (const item of order.items) {
    const productId = String(item.productId);
    quantitiesByProduct.set(
      productId,
      (quantitiesByProduct.get(productId) || 0) + Number(item.quantity)
    );
  }

  for (const [productId, quantity] of quantitiesByProduct) {
    await Product.updateOne(
      { _id: productId },
      { $inc: { stock: quantity } }
    );
  }

  return order;
}
