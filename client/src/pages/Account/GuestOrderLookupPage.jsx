import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { lookupGuestOrder } from "../../services/orderService.js";
import "./GuestOrderLookupPage.css";

const statusLabels = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(price) || 0);
}

function formatDate(date) {
  return new Date(date).toLocaleString("vi-VN");
}

export default function GuestOrderLookupPage() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    orderId: searchParams.get("orderId") || "",
    phone: "",
  });
  const [order, setOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setOrder(null);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setOrder(null);
    setError("");

    try {
      const result = await lookupGuestOrder({
        orderId: form.orderId.trim(),
        phone: form.phone.trim(),
      });
      setOrder(result);
    } catch (requestError) {
      setError(requestError.message || "Không thể tra cứu đơn hàng.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="guest-order-page">
      <header className="guest-order-heading">
        <p className="guest-order-eyebrow">MODENA</p>
        <h1>Tra cứu đơn hàng</h1>
        <p>Nhập mã đơn và số điện thoại đã dùng khi đặt hàng.</p>
      </header>

      <form className="guest-order-form" onSubmit={handleSubmit}>
        <label>
          Mã đơn hàng
          <input
            name="orderId"
            value={form.orderId}
            onChange={handleChange}
            placeholder="Ví dụ: 673a1b2c3d4e5f6789012345"
            required
          />
        </label>

        <label>
          Số điện thoại đặt hàng
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Số điện thoại nhận hàng"
            autoComplete="tel"
            maxLength={20}
            required
          />
        </label>

        {error && <p className="guest-order-error" role="alert">{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang tra cứu..." : "Tra cứu đơn hàng"}
        </button>
      </form>

      {order && (
        <section className="guest-order-result" aria-live="polite">
          <header className="guest-order-result-heading">
            <div>
              <span>Mã đơn hàng</span>
              <strong>{order._id}</strong>
            </div>
            <span className={`order-status order-status-${order.status}`}>
              {statusLabels[order.status] || order.status}
            </span>
          </header>

          <p className="guest-order-date">Đặt lúc: {formatDate(order.createdAt)}</p>
          <p className="guest-order-recipient">
            Người nhận: {order.customer.fullName}
          </p>

          <div className="guest-order-items">
            {order.items.map((item, index) => (
              <article className="guest-order-item" key={`${item.name}-${index}`}>
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <div className="guest-order-placeholder">MODENA</div>
                )}
                <div>
                  <strong>{item.name}</strong>
                  <span>Số lượng: {item.quantity}</span>
                  {item.size && <span>Kích thước: {item.size}</span>}
                  {item.color && <span>Màu sắc: {item.color}</span>}
                </div>
                <strong>{formatPrice(item.lineTotal)}</strong>
              </article>
            ))}
          </div>

          <div className="guest-order-total">
            <span>Tổng thanh toán</span>
            <strong>{formatPrice(order.totalAmount)}</strong>
          </div>
        </section>
      )}

      <Link className="guest-order-back-link" to="/">
        ← Quay lại mua sắm
      </Link>
    </main>
  );
}
