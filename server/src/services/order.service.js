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

export async function createOrder(orderInput) {
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

      orderItems.push({
        productId: product._id,
        name: product.name,
        image: product.images?.[0] || "",
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
      customer: orderInput.customer,
      items: orderItems,
      totalAmount,
      paymentMethod: "cod",
    });
  } catch (error) {
    if (reservedProducts.length > 0) {
      await restoreStock(reservedProducts);
    }

    throw error;
  }
}