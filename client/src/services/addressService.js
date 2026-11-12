async function request(path, token, options = {}) {
  const response = await fetch(`/api/auth/addresses${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Không thể xử lý sổ địa chỉ.");
  }

  return result.data;
}

export function getAddresses(token) {
  return request("", token);
}

export function createAddress(token, address) {
  return request("", token, {
    method: "POST",
    body: JSON.stringify(address),
  });
}

export function updateAddress(token, addressId, address) {
  return request(`/${addressId}`, token, {
    method: "PUT",
    body: JSON.stringify(address),
  });
}

export function deleteAddress(token, addressId) {
  return request(`/${addressId}`, token, {
    method: "DELETE",
  });
}
