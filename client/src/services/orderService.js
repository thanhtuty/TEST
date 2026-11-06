export const createOrder= async (orderData)=>{
    const response = await fetch("/api/orders",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
    });
    const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Không thể tạo đơn hàng.");
  }

  return result.data;
}