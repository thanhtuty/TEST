const PHONE_PATTERN = /^[0-9+().\s-]{9,20}$/;

export function validateAddressPayload(body = {}) {
  const label = typeof body.label === "string" ? body.label.trim() : "";
  const fullName =
    typeof body.fullName === "string" ? body.fullName.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const address =
    typeof body.address === "string" ? body.address.trim() : "";
  const phoneDigits = phone.replace(/\D/g, "").length;

  if (label.length < 2 || label.length > 40) {
    return {
      valid: false,
      message: "Tên địa chỉ phải có từ 2 đến 40 ký tự.",
    };
  }

  if (fullName.length < 2 || fullName.length > 100) {
    return {
      valid: false,
      message: "Tên người nhận phải có từ 2 đến 100 ký tự.",
    };
  }

  if (!PHONE_PATTERN.test(phone) || phoneDigits < 9 || phoneDigits > 15) {
    return { valid: false, message: "Vui lòng nhập số điện thoại hợp lệ." };
  }

  if (address.length < 8 || address.length > 300) {
    return {
      valid: false,
      message: "Địa chỉ phải có từ 8 đến 300 ký tự.",
    };
  }

  if (body.isDefault != null && typeof body.isDefault !== "boolean") {
    return { valid: false, message: "Lựa chọn địa chỉ mặc định không hợp lệ." };
  }

  return {
    valid: true,
    value: {
      label,
      fullName,
      phone,
      address,
      isDefault: body.isDefault === true,
    },
  };
}
