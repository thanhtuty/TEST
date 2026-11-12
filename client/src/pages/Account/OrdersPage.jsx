import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext.jsx";
import { getMyOrders } from "../../services/orderService.js";
import "./OrderHistory.css";

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

export default function OrdersPage() {
  const { user, token, isAuthLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    if (!token) {
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    setIsLoading(true);
    setError("");

    getMyOrders(token)
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  if (isAuthLoading) {
    return (
      <main className="orders-page">
        <p role="status">Đang kiểm tra tài khoản...</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="orders-page">
      <header className="orders-heading">
        <div>
          <p className="orders-eyebrow">TÀI KHOẢN</p>
          <h1>Đơn hàng của tôi</h1>
        </div>
        <Link to="/">Tiếp tục mua sắm</Link>
      </header>

      {isLoading && <p role="status">Đang tải đơn hàng...</p>}
      {error && <p className="orders-error" role="alert">{error}</p>}

      {!isLoading && !error && orders.length === 0 && (
        <section className="orders-empty">
          <p>Bạn chưa có đơn hàng nào.</p>
          <Link to="/">Khám phá sản phẩm</Link>
        </section>
      )}

      {!isLoading && !error && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order._id}>
              <div className="order-card-heading">
                <div>
                  <span className="order-muted">Mã đơn hàng</span>
                  <strong>{order._id}</strong>
                </div>
                <span className={`order-status order-status-${order.status}`}>
                  {statusLabels[order.status] || order.status}
                </span>
              </div>

              <div className="order-card-info">
                <span>{formatDate(order.createdAt)}</span>
                <span>{order.items.length} sản phẩm</span>
                <strong>{formatPrice(order.totalAmount)}</strong>
              </div>

              <Link to={`/account/orders/${order._id}`}>
                Xem chi tiết
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
