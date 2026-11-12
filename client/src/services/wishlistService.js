async function request(path, token, options = {}) {
  const response = await fetch(`/api/auth/wishlist${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Không thể xử lý danh sách yêu thích.");
  }

  return result.data;
}

export function getWishlist(token) {
  return request("", token);
}

export function addWishlistItem(token, productId) {
  return request(`/${productId}`, token, { method: "POST" });
}

export function removeWishlistItem(token, productId) {
  return request(`/${productId}`, token, { method: "DELETE" });
}
