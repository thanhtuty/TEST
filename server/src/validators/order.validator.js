const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

export function validateOrderPayload(body) {
  const errors = [];
  const customerInput = body?.customer || {};

  const fullName =
    typeof customerInput.fullName === "string"
      ? customerInput.fullName.trim()
      : "";

  const phone =
    typeof customerInput.phone === "string"
      ? customerInput.phone.trim()
      : "";

  const address =
    typeof customerInput.address === "string"
      ? customerInput.address.trim()
      : "";

  const note =
    typeof customerInput.note === "string"
      ? customerInput.note.trim()
      : "";

  const phoneDigits = phone.replace(/\D/g, "").length;

  if (fullName.length < 2 || fullName.length > 100) {
    errors.push("Vui lòng nhập họ tên từ 2 đến 100 ký tự.");
  }

  if (
    !/^[0-9+().\s-]{9,20}$/.test(phone) ||
    phoneDigits < 9 ||
    phoneDigits > 15
  ) {
    errors.push("Vui lòng nhập số điện thoại hợp lệ.");
  }

  if (address.length < 8 || address.length > 300) {
    errors.push("Vui lòng nhập địa chỉ từ 8 đến 300 ký tự.");
  }

  if (note.length > 500) {
    errors.push("Ghi chú không được quá 500 ký tự.");
  }

  if (!Array.isArray(body?.items) || body.items.length === 0) {
    errors.push("Giỏ hàng đang trống.");
    return { valid: false, errors };
  }

  const quantities = new Map();

  for (const item of body.items) {
    const productId = String(item?.productId || "");
    const quantity = Number(item?.quantity);

    if (!OBJECT_ID_PATTERN.test(productId)) {
      errors.push("Sản phẩm trong giỏ hàng không hợp lệ.");
      continue;
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      errors.push("Số lượng sản phẩm phải từ 1 đến 99.");
      continue;
    }

    if (
      (item?.size != null && typeof item.size !== "string") ||
      (item?.color != null && typeof item.color !== "string")
    ) {
      errors.push("Kích thước hoặc màu sắc không hợp lệ.");
      continue;
    }

    const size = item.size?.trim() || "";
    const color = item.color?.trim() || "";

    if (size.length > 50 || color.length > 50) {
      errors.push("Kích thước hoặc màu sắc không hợp lệ.");
      continue;
    }

    const key = JSON.stringify([productId, size, color]);
    const totalQuantity = (quantities.get(key)?.quantity || 0) + quantity;

    if (totalQuantity > 99) {
      errors.push("Số lượng mỗi lựa chọn sản phẩm tối đa là 99.");
      continue;
    }

    quantities.set(key, { productId, size, color, quantity: totalQuantity });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    value: {
      customer: { fullName, phone, address, note },
      items: Array.from(quantities.values()),
    },
  };
}

export function validateGuestOrderLookup(body = {}) {
  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const phoneDigits = phone.replace(/\D/g, "").length;

  if (!OBJECT_ID_PATTERN.test(orderId)) {
    return {
      valid: false,
      message: "Vui lòng nhập mã đơn hàng hợp lệ.",
    };
  }

  if (
    !/^[0-9+().\s-]{9,20}$/.test(phone) ||
    phoneDigits < 9 ||
    phoneDigits > 15
  ) {
    return {
      valid: false,
      message: "Vui lòng nhập số điện thoại hợp lệ.",
    };
  }

  return {
    valid: true,
    value: { orderId, phone },
  };
}
