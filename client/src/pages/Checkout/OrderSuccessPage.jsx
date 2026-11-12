import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { useAuth } from "../../context/AuthContext.jsx";
import { getMyOrder, lookupGuestOrder } from "../../services/orderService.js";
import { OrderConfirmation } from "./CheckoutPage.jsx";
import "./CheckoutPage.css";

export default function OrderSuccessPage() {
  const { id } = useParams();
  const location = useLocation();
  const { token, isAuthLoading } = useAuth();
  const incomingOrder = location.state?.order;
  const hasIncomingOrder = incomingOrder?._id === id;
  const [order, setOrder] = useState(
    hasIncomingOrder ? incomingOrder : null
  );
  const [isLoading, setIsLoading] = useState(!hasIncomingOrder);
  const [phone, setPhone] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    if (isAuthLoading) return () => {
      active = false;
    };

    if (hasIncomingOrder && (!incomingOrder.user || !token)) {
      setOrder(incomingOrder);
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    if (!token) {
      setOrder(null);
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    setIsLoading(true);
    setError("");
    getMyOrder(token, id)
      .then((data) => {
        if (active) setOrder(data);
      })
      .catch((requestError) => {
        if (active) {
          setOrder(null);
          setError(requestError.message || "Không thể tải đơn hàng.");
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [hasIncomingOrder, id, incomingOrder, isAuthLoading, token]);

  async function handleLookup(event) {
    event.preventDefault();
    setError("");
    setIsLookingUp(true);

    try {
      const foundOrder = await lookupGuestOrder({ orderId: id, phone });
      setOrder(foundOrder);
    } catch (requestError) {
      setError(requestError.message || "Không thể tra cứu đơn hàng.");
    } finally {
      setIsLookingUp(false);
    }
  }

  if (isAuthLoading || isLoading) {
    return (
      <main className="checkout-page">
        <p className="checkout-notice" role="status">
          Đang tải thông tin đơn hàng...
        </p>
      </main>
    );
  }

  if (order) return <OrderConfirmation order={order} />;

  if (token) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty checkout-order-recovery">
          <p className="checkout-eyebrow">ĐƠN HÀNG</p>
          <h1>Không thể mở đơn hàng này</h1>
          <p>{error || "Đơn hàng không tồn tại hoặc không thuộc tài khoản này."}</p>
          <Link className="checkout-primary-link" to="/account/orders">
            Xem đơn hàng của tôi
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <section className="checkout-empty checkout-order-recovery">
        <p className="checkout-eyebrow">ĐƠN HÀNG</p>
        <h1>Tra cứu xác nhận đơn hàng</h1>
        <p>
          Mã đơn <strong>{id}</strong>. Nhập số điện thoại đã dùng khi đặt hàng
          để xem lại xác nhận.
        </p>
        <p>
          Nếu bạn đặt hàng bằng tài khoản, hãy <Link to="/login">đăng nhập</Link>
          để xem đơn trong khu vực tài khoản.
        </p>

        <form className="checkout-lookup-form" onSubmit={handleLookup}>
          <label>
            Số điện thoại đặt hàng
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
              maxLength={20}
              required
            />
          </label>

          {error && (
            <p className="checkout-alert" role="alert">
              {error}
            </p>
          )}

          <button
            className="checkout-submit-button"
            type="submit"
            disabled={isLookingUp}
          >
            {isLookingUp ? "Đang tra cứu..." : "Xem xác nhận đơn hàng"}
          </button>
        </form>

        <Link className="checkout-back-link" to="/track-order">
          Tra cứu trạng thái đơn hàng
        </Link>
      </section>
    </main>
  );
}
