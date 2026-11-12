import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useCart } from "../../context/CartContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { createOrder } from "../../services/orderService.js";
import { getProductById } from "../../services/productService.js";
import { getAddresses } from "../../services/addressService.js";
import {
  clearCheckoutRequestKey,
  getCheckoutRequestKey,
} from "../../services/checkoutRequest.js";
import "./CheckoutPage.css";

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(price) || 0);
}

function CheckoutSteps({ currentStep }) {
  return (
    <ol className="checkout-steps" aria-label="Tiến trình đặt hàng">
      <li className={currentStep >= 1 ? "is-current" : ""}>
        <span className="checkout-step-number">01</span>
        <span>Thông tin giao hàng</span>
      </li>
      <li className={currentStep >= 2 ? "is-current" : ""}>
        <span className="checkout-step-number">02</span>
        <span>Hoàn tất đơn hàng</span>
      </li>
    </ol>
  );
}

export function OrderConfirmation({ order }) {
  return (
    <main className="checkout-page">
      <CheckoutSteps currentStep={2} />

      <section className="checkout-success">
        <div className="checkout-success-icon" aria-hidden="true">
          ✓
        </div>

        <p className="checkout-eyebrow">ĐẶT HÀNG THÀNH CÔNG</p>
        <h1>Cảm ơn bạn đã đặt hàng!</h1>
        <p className="checkout-success-description">
          MODENA đã nhận được đơn hàng của bạn. Chúng tôi sẽ liên hệ để xác
          nhận trước khi giao hàng.
        </p>

        <div className="checkout-order-number">
          <span>Mã đơn hàng</span>
          <strong>{order._id}</strong>
        </div>

        {order.user ? (
          <Link
            className="checkout-secondary-link"
            to={`/account/orders/${order._id}`}
          >
            Xem đơn hàng trong tài khoản
          </Link>
        ) : (
          <Link
            className="checkout-secondary-link"
            to={`/track-order?orderId=${encodeURIComponent(order._id)}`}
          >
            Tra cứu đơn hàng
          </Link>
        )}

        <div className="checkout-confirmation-grid">
          <section className="checkout-confirmation-card">
            <h2>Thông tin nhận hàng</h2>
            <dl className="checkout-detail-list">
              <div>
                <dt>Người nhận</dt>
                <dd>{order.customer.fullName}</dd>
              </div>
              {order.customer.phone && (
                <div>
                  <dt>Số điện thoại</dt>
                  <dd>{order.customer.phone}</dd>
                </div>
              )}
              {order.customer.address && (
                <div>
                  <dt>Địa chỉ</dt>
                  <dd>{order.customer.address}</dd>
                </div>
              )}
              {order.customer.note && (
                <div>
                  <dt>Ghi chú</dt>
                  <dd>{order.customer.note}</dd>
                </div>
              )}
              <div>
                <dt>Thanh toán</dt>
                <dd>Thanh toán khi nhận hàng (COD)</dd>
              </div>
            </dl>
          </section>

          <section className="checkout-confirmation-card">
            <h2>Đơn hàng của bạn</h2>

            <div className="checkout-order-items">
              {order.items.map((item, index) => (
                <div
                  className="checkout-order-item"
                  key={`${item.productId}-${index}`}
                >
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="checkout-item-placeholder">MODENA</div>
                  )}

                  <div className="checkout-order-item-info">
                    <strong>{item.name}</strong>
                    <span>Số lượng: {item.quantity}</span>
                    {item.size && <span>Kích thước: {item.size}</span>}
                    {item.color && <span>Màu sắc: {item.color}</span>}
                  </div>

                  <strong className="checkout-order-item-price">
                    {formatPrice(item.lineTotal)}
                  </strong>
                </div>
              ))}
            </div>

            <div className="checkout-confirmation-total">
              <span>Tổng thanh toán</span>
              <strong>{formatPrice(order.totalAmount)}</strong>
            </div>
          </section>
        </div>

        <Link className="checkout-primary-link" to="/">
          Tiếp tục mua sắm
        </Link>
      </section>
    </main>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    items,
    clearCart,
    isCartSyncing,
    cartSyncError,
    retryCartSync,
  } = useCart();
  const { token } = useAuth();

  const [customer, setCustomer] = useState({
    fullName: "",
    phone: "",
    address: "",
    note: "",
  });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressLoadError, setAddressLoadError] = useState("");
  const [currentProducts, setCurrentProducts] = useState([]);
  const [isRefreshingCart, setIsRefreshingCart] = useState(true);
  const [inventoryError, setInventoryError] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshAttempt, setRefreshAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    if (!token) {
      setSavedAddresses([]);
      setSelectedAddressId("");
      return () => {
        active = false;
      };
    }

    getAddresses(token)
      .then((addresses) => {
        if (!active) return;

        setSavedAddresses(addresses);
        setAddressLoadError("");

        const defaultAddress = addresses.find((address) => address.isDefault);
        if (!defaultAddress) return;

        setSelectedAddressId(defaultAddress._id);
        setCustomer((currentCustomer) => ({
          ...currentCustomer,
          fullName: defaultAddress.fullName,
          phone: defaultAddress.phone,
          address: defaultAddress.address,
        }));
      })
      .catch(() => {
        if (active) {
          setAddressLoadError(
            "Chưa tải được địa chỉ đã lưu. Bạn vẫn có thể nhập thông tin bên dưới."
          );
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    let isActive = true;

    async function refreshCartProducts() {
      if (items.length === 0) {
        setCurrentProducts([]);
        setInventoryError("");
        setIsRefreshingCart(false);
        return;
      }

      setIsRefreshingCart(true);
      setInventoryError("");

      try {
        const products = await Promise.all(
          items.map((item) => getProductById(item.productId))
        );

        if (!isActive) return;

        setCurrentProducts(products);

        const quantityByProduct = new Map();
        items.forEach((item) => {
          quantityByProduct.set(
            item.productId,
            (quantityByProduct.get(item.productId) || 0) +
              Number(item.quantity || 0)
          );
        });

        const unavailableItems = items.filter((item) => {
          const product = products.find(
            (currentProduct) => currentProduct._id === item.productId
          );

          if (
            !product ||
            Number(product.stock) < quantityByProduct.get(item.productId)
          ) {
            return true;
          }

          const sizeUnavailable = product.sizes?.length
            ? !item.size || !product.sizes.includes(item.size)
            : Boolean(item.size);

          const colorUnavailable = product.colors?.length
            ? !item.color || !product.colors.includes(item.color)
            : Boolean(item.color);

          return sizeUnavailable || colorUnavailable;
        });

        if (unavailableItems.length > 0) {
          setInventoryError(
            "Một số sản phẩm không còn đủ hàng. Vui lòng quay lại giỏ hàng để cập nhật."
          );
        }
      } catch {
        if (isActive) {
          setCurrentProducts([]);
          setInventoryError(
            "Chưa thể kiểm tra giá và tồn kho. Vui lòng thử tải lại."
          );
        }
      } finally {
        if (isActive) setIsRefreshingCart(false);
      }
    }

    refreshCartProducts();

    return () => {
      isActive = false;
    };
  }, [items, refreshAttempt]);

  const checkoutItems = items.map((item) => {
    const product = currentProducts.find(
      (currentProduct) => currentProduct._id === item.productId
    );

    return {
      ...item,
      name: product?.name ?? item.name,
      image: product?.images?.[0] ?? item.image,
      currentPrice: product?.price ?? item.price,
    };
  });

  const total = checkoutItems.reduce(
    (sum, item) => sum + Number(item.currentPrice) * item.quantity,
    0
  );

  const canSubmit =
    !isSubmitting &&
    !isCartSyncing &&
    !isRefreshingCart &&
    !inventoryError &&
    currentProducts.length === items.length;

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === "fullName" || name === "phone" || name === "address") {
      setSelectedAddressId("");
    }

    setCustomer((currentCustomer) => ({
      ...currentCustomer,
      [name]: value,
    }));
  }

  function handleSavedAddressChange(event) {
    const addressId = event.target.value;
    setSelectedAddressId(addressId);

    const selectedAddress = savedAddresses.find(
      (address) => address._id === addressId
    );

    if (!selectedAddress) return;

    setCustomer((currentCustomer) => ({
      ...currentCustomer,
      fullName: selectedAddress.fullName,
      phone: selectedAddress.phone,
      address: selectedAddress.address,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer,
        items: items.map(({ productId, quantity, size, color }) => ({
          productId,
          quantity,
          size,
          color,
        })),
      };
      const idempotencyKey = getCheckoutRequestKey(orderPayload);
      const createdOrder = await createOrder(orderPayload, token, idempotencyKey);

      clearCheckoutRequestKey(idempotencyKey);
      clearCart();
      navigate(`/order-success/${createdOrder._id}`, {
        replace: true,
        state: { order: createdOrder },
      });
    } catch (requestError) {
      if (requestError.statusCode === 409) {
        setInventoryError(requestError.message);
      } else {
        setError(requestError.message || "Không thể tạo đơn hàng lúc này.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    if (isCartSyncing) {
      return (
        <main className="checkout-page">
          <p className="checkout-notice" role="status">
            {cartSyncError || "Đang tải giỏ hàng đã lưu..."}
          </p>
          {cartSyncError && (
            <button
              className="checkout-retry-button"
              type="button"
              onClick={retryCartSync}
            >
              Thử đồng bộ lại
            </button>
          )}
        </main>
      );
    }

    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <span className="checkout-eyebrow">GIỎ HÀNG</span>
          <h1>Giỏ hàng của bạn đang trống</h1>
          <p>Hãy chọn sản phẩm yêu thích trước khi tiến hành đặt hàng.</p>
          <Link className="checkout-primary-link" to="/">
            Khám phá sản phẩm
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <CheckoutSteps currentStep={1} />

      <header className="checkout-heading">
        <div>
          <p className="checkout-eyebrow">GẦN HOÀN TẤT RỒI</p>
          <h1>Thông tin đặt hàng</h1>
          <p>Điền thông tin nhận hàng để MODENA chuẩn bị đơn cho bạn.</p>
        </div>

        <Link className="checkout-back-link" to="/cart">
          ← Quay lại giỏ hàng
        </Link>
      </header>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <section className="checkout-form-section">
            <div className="checkout-section-heading">
              <span className="checkout-section-icon">01</span>
              <div>
                <h2>Thông tin giao hàng</h2>
                <p>Thông tin này sẽ được dùng để giao đơn hàng của bạn.</p>
              </div>
            </div>

            <div className="checkout-fields">
              {savedAddresses.length > 0 && (
                <label className="checkout-field checkout-field-full">
                  <span>Chọn địa chỉ đã lưu</span>
                  <select
                    value={selectedAddressId}
                    onChange={handleSavedAddressChange}
                  >
                    <option value="">Nhập địa chỉ khác</option>
                    {savedAddresses.map((savedAddress) => (
                      <option key={savedAddress._id} value={savedAddress._id}>
                        {savedAddress.label} — {savedAddress.address}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {addressLoadError && (
                <p className="checkout-summary-message checkout-field-full">
                  {addressLoadError}
                </p>
              )}

              <label className="checkout-field checkout-field-full">
                <span>Họ và tên <b>*</b></span>
                <input
                  name="fullName"
                  value={customer.fullName}
                  onChange={handleChange}
                  placeholder="Ví dụ: Nguyễn Minh Anh"
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  required
                />
              </label>

              <label className="checkout-field checkout-field-full">
                <span>Số điện thoại <b>*</b></span>
                <input
                  name="phone"
                  type="tel"
                  value={customer.phone}
                  onChange={handleChange}
                  placeholder="Ví dụ: 0912 345 678"
                  maxLength={20}
                  autoComplete="tel"
                  required
                />
              </label>

              <label className="checkout-field checkout-field-full">
                <span>Địa chỉ nhận hàng <b>*</b></span>
                <textarea
                  name="address"
                  value={customer.address}
                  onChange={handleChange}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  minLength={8}
                  maxLength={300}
                  autoComplete="street-address"
                  rows={3}
                  required
                />
              </label>

              <label className="checkout-field checkout-field-full">
                <span>Ghi chú <small>Không bắt buộc</small></span>
                <textarea
                  name="note"
                  value={customer.note}
                  onChange={handleChange}
                  placeholder="Lưu ý thêm cho người giao hàng..."
                  maxLength={500}
                  rows={2}
                />
              </label>
            </div>
          </section>

          <section className="checkout-payment">
            <div className="checkout-section-heading">
              <span className="checkout-section-icon">02</span>
              <div>
                <h2>Thanh toán</h2>
                <p>Thanh toán trực tiếp khi bạn nhận được hàng.</p>
              </div>
            </div>

            <div className="checkout-cod-option">
              <span className="checkout-radio-mark" aria-hidden="true" />
              <div>
                <strong>Thanh toán khi nhận hàng (COD)</strong>
                <span>Bạn thanh toán cho đơn vị vận chuyển khi nhận hàng.</span>
              </div>
              <span className="checkout-cod-tag">ĐANG CHỌN</span>
            </div>
          </section>

          {isRefreshingCart && (
            <p className="checkout-notice" role="status">
              Đang kiểm tra giá và tồn kho sản phẩm...
            </p>
          )}

          {isCartSyncing && (
            <p className="checkout-notice" role="status">
              Đang đồng bộ giỏ hàng với tài khoản...
            </p>
          )}

          {cartSyncError && (
            <div className="checkout-alert" role="alert">
              <p>{cartSyncError}</p>
              <button
                className="checkout-retry-button"
                type="button"
                onClick={retryCartSync}
              >
                Thử đồng bộ lại
              </button>
            </div>
          )}

          {inventoryError && (
            <div className="checkout-alert" role="alert">
              <p>{inventoryError}</p>
              <Link className="checkout-alert-link" to="/cart">
                Quay lại giỏ hàng để cập nhật
              </Link>
              <button
                type="button"
                className="checkout-retry-button"
                onClick={() => setRefreshAttempt((attempt) => attempt + 1)}
              >
                Thử tải lại
              </button>
            </div>
          )}

          {error && (
            <p className="checkout-alert" role="alert">
              {error}
            </p>
          )}

          <button
            className="checkout-submit-button"
            type="submit"
            disabled={!canSubmit}
          >
            {isSubmitting
              ? "Đang xử lý đơn hàng..."
              : `Xác nhận đặt hàng · ${formatPrice(total)}`}
          </button>

          <p className="checkout-secure-note">
            Thông tin của bạn được sử dụng để xử lý và giao đơn hàng. {" "}
            <Link to="/shipping-returns">Xem giao hàng và đổi trả</Link>
          </p>
        </form>

        <aside className="checkout-summary">
          <div className="checkout-summary-heading">
            <div>
              <p className="checkout-eyebrow">MODENA</p>
              <h2>Đơn hàng của bạn</h2>
            </div>
            <span className="checkout-item-count">
              {items.reduce((count, item) => count + item.quantity, 0)} sản phẩm
            </span>
          </div>

          {isRefreshingCart ? (
            <p className="checkout-summary-message" role="status">
              Đang cập nhật đơn hàng...
            </p>
          ) : currentProducts.length === 0 ? (
            <p className="checkout-summary-message">
              Chưa tải được thông tin sản phẩm. Hãy thử tải lại.
            </p>
          ) : (
            <>
              <div className="checkout-summary-items">
                {checkoutItems.map((item) => (
                  <div
                    className="checkout-summary-item"
                    key={JSON.stringify([
                      item.productId,
                      item.size || "",
                      item.color || "",
                    ])}
                  >
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="checkout-item-placeholder">MODENA</div>
                    )}

                    <div className="checkout-summary-item-info">
                      <strong>{item.name}</strong>
                      <span>Số lượng: {item.quantity}</span>
                      {item.size && <span>Kích thước: {item.size}</span>}
                      {item.color && <span>Màu sắc: {item.color}</span>}
                    </div>

                    <strong className="checkout-summary-item-price">
                      {formatPrice(
                        Number(item.currentPrice) * item.quantity
                      )}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="checkout-summary-row">
                <span>Tạm tính</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="checkout-summary-row">
                <span>Phí vận chuyển</span>
                <span className="checkout-shipping-free">Miễn phí</span>
              </div>
              <div className="checkout-summary-total">
                <span>Tổng thanh toán</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <p className="checkout-summary-footnote">
                Giá sản phẩm được cập nhật theo giá hiện tại.
              </p>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
