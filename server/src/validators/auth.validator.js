const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+().\s-]{9,20}$/;

export function validateRegistration(body = {}) {
  const fullName =
    typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone =
    typeof body.phone === "string" ? body.phone.trim() : "";
  const password =
    typeof body.password === "string" ? body.password : "";

  const phoneDigits = phone.replace(/\D/g, "").length;

  if (fullName.length < 2 || fullName.length > 100) {
    return { valid: false, message: "Họ tên phải có từ 2 đến 100 ký tự." };
  }

  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return { valid: false, message: "Vui lòng nhập email hợp lệ." };
  }

  if (!PHONE_PATTERN.test(phone) || phoneDigits < 9 || phoneDigits > 15) {
    return { valid: false, message: "Vui lòng nhập số điện thoại hợp lệ." };
  }

  if (password.length < 8 || password.length > 128) {
    return {
      valid: false,
      message: "Mật khẩu phải có từ 8 đến 128 ký tự.",
    };
  }

  return {
    valid: true,
    value: { fullName, email, phone, password },
  };
}

export function validateLogin(body = {}) {
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password =
    typeof body.password === "string" ? body.password : "";

  if (!EMAIL_PATTERN.test(email) || !password || password.length > 128) {
    return {
      valid: false,
      message: "Vui lòng kiểm tra email và mật khẩu.",
    };
  }

  return {
    valid: true,
    value: { email, password },
  };
}
export function validateProfileUpdate(body = {}) {
  const fullName =
    typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone =
    typeof body.phone === "string" ? body.phone.trim() : "";

  const phoneDigits = phone.replace(/\D/g, "").length;

  if (fullName.length < 2 || fullName.length > 100) {
    return { valid: false, message: "Họ tên phải có từ 2 đến 100 ký tự." };
  }

  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return { valid: false, message: "Vui lòng nhập email hợp lệ." };
  }

  if (!PHONE_PATTERN.test(phone) || phoneDigits < 9 || phoneDigits > 15) {
    return { valid: false, message: "Vui lòng nhập số điện thoại hợp lệ." };
  }

  return {
    valid: true,
    value: { fullName, email, phone },
  };
}

export function validatePasswordChange(body = {}) {
  const currentPassword =
    typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword =
    typeof body.newPassword === "string" ? body.newPassword : "";

  if (!currentPassword || currentPassword.length > 128) {
    return {
      valid: false,
      message: "Vui lòng nhập mật khẩu hiện tại.",
    };
  }

  if (newPassword.length < 8 || newPassword.length > 128) {
    return {
      valid: false,
      message: "Mật khẩu mới phải có từ 8 đến 128 ký tự.",
    };
  }

  if (currentPassword === newPassword) {
    return {
      valid: false,
      message: "Mật khẩu mới phải khác mật khẩu hiện tại.",
    };
  }

  return {
    valid: true,
    value: { currentPassword, newPassword },
  };
}
