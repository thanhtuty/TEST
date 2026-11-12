const STORAGE_KEY = "modena-checkout-request";

function createIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  if (globalThis.crypto?.getRandomValues) {
    const randomValues = new Uint8Array(16);
    globalThis.crypto.getRandomValues(randomValues);
    const hexadecimal = [...randomValues]
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");
    return `${hexadecimal.slice(0, 8)}-${hexadecimal.slice(8, 12)}-${hexadecimal.slice(12, 16)}-${hexadecimal.slice(16, 20)}-${hexadecimal.slice(20)}`;
  }

  throw new Error("Trình duyệt không hỗ trợ tạo phiên đặt hàng an toàn.");
}

export function getCheckoutRequestKey(orderPayload) {
  const fingerprint = JSON.stringify(orderPayload);

  try {
    const savedRequest = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
    if (savedRequest?.fingerprint === fingerprint && savedRequest.key) {
      return savedRequest.key;
    }
  } catch {
    // Tạo khóa mới nếu dữ liệu phiên cũ không đọc được.
  }

  const key = createIdempotencyKey();

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ fingerprint, key }));
  } catch {
    // Khóa vẫn được dùng cho lần gửi hiện tại nếu sessionStorage bị chặn.
  }

  return key;
}

export function clearCheckoutRequestKey(key) {
  try {
    const savedRequest = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
    if (savedRequest?.key === key) sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage may be unavailable in restricted browser contexts.
    }
  }
}
