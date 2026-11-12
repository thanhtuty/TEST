async function request(path, options = {}) {
  const response = await fetch(`/api/auth${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Không thể xử lý tài khoản.");
  }

  return result.data;
}

export function registerCustomer(customer) {
  return request("/register", {
    method: "POST",
    body: JSON.stringify(customer),
  });
}

export function loginCustomer(credentials) {
  return request("/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function getCurrentUser(token) {
  return request("/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function logoutCustomer(token) {
  return request("/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function updateCustomerProfile(token, profile) {
  return request("/profile", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profile),
  });
}

export function changeCustomerPassword(token, passwords) {
  return request("/password", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(passwords),
  });
}
