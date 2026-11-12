async function request(path, token, { method = "GET", items } = {}) {
  const response = await fetch(`/api/cart${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(items ? { "Content-Type": "application/json" } : {}),
    },
    ...(items ? { body: JSON.stringify({ items }) } : {}),
  });

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      "API giỏ hàng không trả dữ liệu JSON. Hãy khởi động lại server rồi thử lại."
    );
  }

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Không thể đồng bộ giỏ hàng.");
  }

  return result.data;
}

export function getAccountCart(token) {
  return request("", token);
}

export function mergeGuestCart(token, items) {
  return request("/merge", token, { method: "POST", items });
}

export function saveAccountCart(token, items) {
  return request("", token, { method: "PUT", items });
}
