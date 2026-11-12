const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

export function validateCartPayload(body = {}) {
  if (!Array.isArray(body.items)) {
    return { valid: false, message: "Giỏ hàng không hợp lệ." };
  }

  if (body.items.length > 100) {
    return { valid: false, message: "Giỏ hàng có quá nhiều sản phẩm." };
  }

  const items = [];

  for (const item of body.items) {
    const productId = String(item?.productId || "");
    const quantity = Number(item?.quantity);
    const priceAtAdd = item?.priceAtAdd;
    const size = item?.size == null ? "" : item.size;
    const color = item?.color == null ? "" : item.color;

    if (!OBJECT_ID_PATTERN.test(productId)) {
      return { valid: false, message: "Sản phẩm trong giỏ hàng không hợp lệ." };
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return { valid: false, message: "Số lượng sản phẩm phải từ 1 đến 99." };
    }

    if (
      priceAtAdd != null &&
      (typeof priceAtAdd !== "number" ||
        !Number.isFinite(priceAtAdd) ||
        priceAtAdd < 0)
    ) {
      return { valid: false, message: "Giá sản phẩm trong giỏ hàng không hợp lệ." };
    }

    if (typeof size !== "string" || typeof color !== "string") {
      return { valid: false, message: "Kích thước hoặc màu sắc không hợp lệ." };
    }

    if (size.trim().length > 50 || color.trim().length > 50) {
      return { valid: false, message: "Kích thước hoặc màu sắc không hợp lệ." };
    }

    items.push({
      productId,
      quantity,
      ...(priceAtAdd == null ? {} : { priceAtAdd }),
      size: size.trim(),
      color: color.trim(),
    });
  }

  return { valid: true, value: items };
}
