export const getProducts = async ({ includeInactive = false } = {}) => {
    const url = includeInactive
        ? "/api/products?includeInactive=true"
        : "/api/products";
    const response = await fetch(url)
    const result = await response.json()
    if (!response.ok || !result.success) {
        throw new Error(result.message || "khong the tai san pham")

    }
    return result.data;
}
export const getProductById = async (id) => {
    const response = await fetch(`/api/products/${id}`)
    const result = await response.json()
    if (!response.ok || !result.success) {
        throw new Error(result.message || "Khong the tai san pham")
    }
    return result.data;
}
export const createProduct = async (product) => {
    const response = await fetch("/api/products", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"

        },
        body: JSON.stringify(product)
    })
    const result = await response.json()
    if (!response.ok || !result.success) {
        throw new Error(result.message || "Khong the tao san pham")

    }
    return result.data
}
export const updateProduct = async (id, product) => {
    const response = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(product)

    })
    const result = await response.json()
    if (!response.ok || !result.success) {
        throw new Error(result.message || "Khong the cap nhat san pham")
    }
    return result.data
}
export const deleteProduct = async (id) => {
    const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",

    })
    const result = await response.json()
    if (!response.ok || !result.success) {
        throw new Error(result.message || "Khong the xoa san pham")
    }
    return result
}

