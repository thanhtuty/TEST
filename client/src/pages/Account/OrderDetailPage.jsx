import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  cancelMyOrder,
  getMyOrder,
} from "../../services/orderService.js";
import { getProductById } from "../../services/productService.js";
import { useCart } from "../../context/CartContext.jsx";
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

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user, token, isAuthLoading } = useAuth();
  const { items: cartItems, addItems, isCartSyncing } = useCart();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [reorderError, setReorderError] = useState("");
  const [reorderMessage, setReorderMessage] = useState("");
  const [isReordering, setIsReordering] = useState(false);

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

    getMyOrder(token, id)
      .then((data) => {
        if (active) setOrder(data);
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
  }, [id, token]);

  async function handleCancelOrder() {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;

    setCancelError("");
    setIsCancelling(true);

    try {
      const updatedOrder = await cancelMyOrder(token, id);
      setOrder(updatedOrder);
    } catch (requestError) {
      setCancelError(requestError.message || "Không thể hủy đơn hàng.");
    } finally {
      setIsCancelling(false);
    }
  }

  async function handleReorder() {
    if (!order || isCartSyncing) return;

    setIsReordering(true);
    setReorderError("");
    setReorderMessage("");

    try {
      const productIds = [...new Set(order.items.map((item) => String(item.productId)))];
      const productResults = await Promise.allSettled(
        productIds.map((productId) => getProductById(productId))
      );
      const productsById = new Map();

      productResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          productsById.set(productIds[index], result.value);
        }
      });

      const cartQuantityByProduct = new Map();
      const cartQuantityByLine = new Map();
      cartItems.forEach((item) => {
        cartQuantityByProduct.set(
          item.productId,
          (cartQuantityByProduct.get(item.productId) || 0) +
            Number(item.quantity || 0)
        );

        const lineKey = JSON.stringify([
          item.productId,
          item.size || "",
          item.color || "",
        ]);
        cartQuantityByLine.set(
          lineKey,
          (cartQuantityByLine.get(lineKey) || 0) +
            Number(item.quantity || 0)
        );
      });

      const plannedQuantityByProduct = new Map();
      const plannedQuantityByLine = new Map();
      const linesToAdd = [];
      let addedQuantity = 0;
      let skippedQuantity = 0;

      for (const orderItem of order.items) {
        const productId = String(orderItem.productId);
        const product = productsById.get(productId);
        const orderQuantity = Number(orderItem.quantity) || 0;

        if (!product) {
          skippedQuantity += orderQuantity;
          continue;
        }

        const size = orderItem.size || "";
        const color = orderItem.color || "";
        const sizeIsValid = product.sizes?.length
          ? product.sizes.includes(size)
          : !size;
        const colorIsValid = product.colors?.length
          ? product.colors.includes(color)
          : !color;

        if (!sizeIsValid || !colorIsValid) {
          skippedQuantity += orderQuantity;
          continue;
        }

        const alreadyInCart = cartQuantityByProduct.get(productId) || 0;
        const alreadyPlanned = plannedQuantityByProduct.get(productId) || 0;
        const lineKey = JSON.stringify([productId, size, color]);
        const lineAlreadyInCart = cartQuantityByLine.get(lineKey) || 0;
        const lineAlreadyPlanned = plannedQuantityByLine.get(lineKey) || 0;
        const remainingLineCapacity = Math.max(
          0,
          99 - lineAlreadyInCart - lineAlreadyPlanned
        );
        const availableStock = Math.max(
          0,
          (Number(product.stock) || 0) - alreadyInCart - alreadyPlanned
        );
        const quantityToAdd = Math.min(
          orderQuantity,
          availableStock,
          remainingLineCapacity
        );

        if (quantityToAdd < 1) {
          skippedQuantity += orderQuantity;
          continue;
        }

        linesToAdd.push({ product, quantity: quantityToAdd, size, color });
        plannedQuantityByProduct.set(
          productId,
          alreadyPlanned + quantityToAdd
        );
        plannedQuantityByLine.set(
          lineKey,
          lineAlreadyPlanned + quantityToAdd
        );
        addedQuantity += quantityToAdd;
        skippedQuantity += orderQuantity - quantityToAdd;
      }

      if (linesToAdd.length === 0) {
        setReorderError("Không có sản phẩm nào còn hàng để thêm vào giỏ.");
        return;
      }

      addItems(linesToAdd);
      setReorderMessage(
        `Đã thêm ${addedQuantity} sản phẩm vào giỏ.${
          skippedQuantity > 0
            ? ` Không thể thêm ${skippedQuantity} sản phẩm do hết hàng hoặc biến thể không còn bán.`
            : ""
        }`
      );
    } catch (requestError) {
      setReorderError(requestError.message || "Không thể mua lại đơn hàng.");
    } finally {
      setIsReordering(false);
    }
  }

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
      <Link to="/account/orders">← Quay lại đơn hàng</Link>

      {isLoading && <p role="status">Đang tải đơn hàng...</p>}
      {error && <p className="orders-error" role="alert">{error}</p>}

      {!isLoading && !error && order && (
        <>
          <header className="orders-heading order-detail-heading">
            <div>
              <p className="orders-eyebrow">CHI TIẾT ĐƠN HÀNG</p>
              <h1>{order._id}</h1>
            </div>
            <span className={`order-status order-status-${order.status}`}>
              {statusLabels[order.status] || order.status}
            </span>
          </header>

          {order.status === "pending" && (
            <button
              className="order-cancel-button"
              type="button"
              onClick={handleCancelOrder}
              disabled={isCancelling}
            >
              {isCancelling ? "Đang hủy..." : "Hủy đơn hàng"}
            </button>
          )}

          {cancelError && (
            <p className="orders-error" role="alert">
              {cancelError}
            </p>
          )}

          <button
            className="order-reorder-button"
            type="button"
            onClick={handleReorder}
            disabled={isReordering || isCartSyncing}
          >
            {isCartSyncing
              ? "Đang đồng bộ giỏ hàng..."
              : isReordering
                ? "Đang thêm vào giỏ..."
                : "Mua lại đơn này"}
          </button>

          {reorderError && (
            <p className="orders-error" role="alert">
              {reorderError}
            </p>
          )}

          {reorderMessage && (
            <p className="order-reorder-message" role="status">
              {reorderMessage} <Link to="/cart">Xem giỏ hàng</Link>
            </p>
          )}

          <section className="order-detail-card">
            <h2>Thông tin nhận hàng</h2>
            <p><strong>{order.customer.fullName}</strong></p>
            <p>{order.customer.phone}</p>
            <p>{order.customer.address}</p>
            {order.customer.note && <p>Ghi chú: {order.customer.note}</p>}
            <p>Thanh toán khi nhận hàng (COD)</p>
          </section>

          <section className="order-detail-card">
            <h2>Sản phẩm</h2>

            <div className="order-detail-items">
              {order.items.map((item, index) => (
                <div
                  className="order-detail-item"
                  key={`${item.productId}-${index}`}
                >
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="order-detail-placeholder">MODENA</div>
                  )}

                  <div>
                    <strong>{item.name}</strong>
                    <p>
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                    {item.size && <p>Kích thước: {item.size}</p>}
                    {item.color && <p>Màu sắc: {item.color}</p>}
                  </div>

                  <strong>{formatPrice(item.lineTotal)}</strong>
                </div>
              ))}
            </div>

            <div className="order-detail-total">
              <span>Tổng thanh toán</span>
              <strong>{formatPrice(order.totalAmount)}</strong>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
