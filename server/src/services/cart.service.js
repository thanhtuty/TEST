import Product from "../models/Product.js";
import User from "../models/User.js";

function createCartError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function combineCartLines(items) {
  const combined = new Map();

  for (const item of items) {
    const productId = String(item.productId?._id || item.productId);
    const size = item.size || "";
    const color = item.color || "";
    const key = JSON.stringify([productId, size, color]);
    const existing = combined.get(key);
    const incomingPriceAtAdd =
      typeof item.priceAtAdd === "number" &&
      Number.isFinite(item.priceAtAdd) &&
      item.priceAtAdd >= 0
        ? item.priceAtAdd
        : undefined;

    combined.set(key, {
      productId,
      size,
      color,
      ...(existing?.priceAtAdd != null
        ? { priceAtAdd: existing.priceAtAdd }
        : incomingPriceAtAdd == null
          ? {}
          : { priceAtAdd: incomingPriceAtAdd }),
      quantity: Math.min(99, (existing?.quantity || 0) + Number(item.quantity)),
    });
  }

  return [...combined.values()].slice(0, 100);
}

async function normalizeCartLines(items) {
  const combined = combineCartLines(items);
  const productIds = [...new Set(combined.map((item) => item.productId))];
  const products = await Product.find({
    _id: { $in: productIds },
    isActive: true,
  }).select("sizes colors stock price");
  const productsById = new Map(
    products.map((product) => [String(product._id), product])
  );
  const usedStockByProduct = new Map();
  const normalizedItems = [];

  for (const item of combined) {
    const product = productsById.get(item.productId);
    if (!product) continue;

    const sizes = product.sizes || [];
    const colors = product.colors || [];
    const sizeIsValid = sizes.length
      ? sizes.includes(item.size)
      : !item.size;
    const colorIsValid = colors.length
      ? colors.includes(item.color)
      : !item.color;

    if (!sizeIsValid || !colorIsValid) continue;

    const usedStock = usedStockByProduct.get(item.productId) || 0;
    const remainingStock = Math.max(
      0,
      (Number(product.stock) || 0) - usedStock
    );
    const quantity = Math.min(item.quantity, remainingStock, 99);

    if (quantity < 1) continue;

    usedStockByProduct.set(item.productId, usedStock + quantity);
    normalizedItems.push({
      productId: product._id,
      priceAtAdd:
        typeof item.priceAtAdd === "number" &&
        Number.isFinite(item.priceAtAdd) &&
        item.priceAtAdd >= 0
          ? item.priceAtAdd
          : product.price,
      quantity,
      size: item.size,
      color: item.color,
    });
  }

  return normalizedItems;
}

export async function getCustomerCart(userId) {
  const user = await User.findById(userId)
    .select("cart")
    .populate({
      path: "cart.productId",
      match: { isActive: true },
      select: "name price images sizes colors stock",
    });

  if (!user) {
    throw createCartError(404, "Không tìm thấy tài khoản.");
  }

  return user.cart.flatMap((item) => {
    const product = item.productId;
    if (!product) return [];

    return [{
      productId: String(product._id),
      name: product.name,
      price: product.price,
      priceAtAdd: item.priceAtAdd ?? product.price,
      image: product.images?.[0] || "",
      stock: product.stock,
      quantity: item.quantity,
      size: item.size || "",
      color: item.color || "",
    }];
  });
}

async function saveCart(user, items) {
  user.cart = await normalizeCartLines(items);
  await user.save();
  return getCustomerCart(user._id);
}

export async function mergeCustomerCart(userId, guestItems) {
  const user = await User.findById(userId).select("cart");

  if (!user) {
    throw createCartError(404, "Không tìm thấy tài khoản.");
  }

  const accountItems = user.cart.map((item) => item.toObject());
  return saveCart(user, [...accountItems, ...guestItems]);
}

export async function replaceCustomerCart(userId, items) {
  const user = await User.findById(userId).select("cart");

  if (!user) {
    throw createCartError(404, "Không tìm thấy tài khoản.");
  }

  return saveCart(user, items);
}
