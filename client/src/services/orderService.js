async function request(
  path,
  { method = "GET", body, token, idempotencyKey } = {}
) {
  const headers = {};

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  const response = await fetch(`/api/orders${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    const error = new Error(result.message || "Không thể xử lý đơn hàng.");
    error.statusCode = response.status;
    throw error;
  }

  return result.data;
}

export function createOrder(orderData, token, idempotencyKey) {
  return request("/", {
    method: "POST",
    body: orderData,
    token,
    idempotencyKey,
  });
}

export function getMyOrders(token) {
  return request("/my", { token });
}

export function getMyOrder(token, orderId) {
  return request(`/my/${orderId}`, { token });
}

export function cancelMyOrder(token, orderId) {
  return request(`/my/${orderId}/cancel`, {
    method: "PATCH",
    token,
  });
}

export function lookupGuestOrder(orderData) {
  return request("/lookup", {
    method: "POST",
    body: orderData,
  });
}
