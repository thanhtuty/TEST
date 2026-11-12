import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useCart } from "../../context/CartContext.jsx";
import { getProductById } from "../../services/productService.js";
import "./CartPage.css";

function formatPrice(price) {
  return `${Number(price).toLocaleString("vi-VN")} ₫`;
}

function cartLineKey(item) {
  return JSON.stringify([item.productId, item.size || "", item.color || ""]);
}

function isSameLine(first, second) {
  return (
    first.productId === second.productId &&
    (first.size || "") === (second.size || "") &&
    (first.color || "") === (second.color || "")
  );
}

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    updateVariant,
    refreshProduct,
    isCartSyncing,
    cartSyncError,
    retryCartSync,
  } = useCart();
  const [productsById, setProductsById] = useState({});
  const [checkedProductIdsKey, setCheckedProductIdsKey] = useState("");
  const [productCheckAttempt, setProductCheckAttempt] = useState(0);
  const productIdsKey = JSON.stringify([
    ...new Set(items.map((item) => item.productId)),
  ]);

  useEffect(() => {
    let active = true;
    const productIds = JSON.parse(productIdsKey);

    Promise.all(
      productIds.map(async (productId) => {
        try {
          return [productId, await getProductById(productId)];
        } catch {
          return [productId, null];
        }
      })
    ).then((entries) => {
      if (!active) return;

      setProductsById(Object.fromEntries(entries));
      setCheckedProductIdsKey(productIdsKey);
      entries.forEach(([, product]) => {
        if (product) refreshProduct(product);
      });
    });

    return () => {
      active = false;
    };
  }, [productIdsKey, productCheckAttempt]);

  const areProductsBeingChecked = checkedProductIdsKey !== productIdsKey;
  const cartHasIssues =
    areProductsBeingChecked ||
    items.some((item) => {
      if (!Object.prototype.hasOwnProperty.call(productsById, item.productId)) {
        return true;
      }

      const product = productsById[item.productId];
      if (!product || !product.isActive || Number(product.stock) < 1) {
        return true;
      }

      const selectedSizeIsValid = product.sizes?.length
        ? product.sizes.includes(item.size || "")
        : !item.size;
      const selectedColorIsValid = product.colors?.length
        ? product.colors.includes(item.color || "")
        : !item.color;
      const productQuantity = items
        .filter((line) => line.productId === item.productId)
        .reduce((sum, line) => sum + Number(line.quantity || 0), 0);

      return (
        !selectedSizeIsValid ||
        !selectedColorIsValid ||
        productQuantity > Number(product.stock)
      );
    });

  const total = items.reduce(
    (sum, item) =>
      sum + Number(productsById[item.productId]?.price ?? item.price) * item.quantity,
    0
  );

  return (
    <main className="cart-page">
      <header className="cart-heading">
        <h1>Giỏ hàng</h1>
        <Link to="/">Tiếp tục mua sắm</Link>
      </header>

      {items.length === 0 ? (
        isCartSyncing ? (
          <div>
            <p role={cartSyncError ? "alert" : "status"}>
              {cartSyncError || "Đang tải giỏ hàng đã lưu..."}
            </p>
            {cartSyncError && (
              <button type="button" onClick={retryCartSync}>
                Thử đồng bộ lại
              </button>
            )}
          </div>
        ) : (
          <p>Giỏ hàng đang trống.</p>
        )
      ) : (
        <div className="cart-layout">
          <section className="cart-items" aria-label="Sản phẩm trong giỏ">
            {isCartSyncing && (
              <p role="status">Đang đồng bộ giỏ hàng với tài khoản...</p>
            )}
            {cartSyncError && (
              <div className="cart-variant-warning" role="alert">
                <p>{cartSyncError}</p>
                <button type="button" onClick={retryCartSync}>
                  Thử đồng bộ lại
                </button>
              </div>
            )}
            {areProductsBeingChecked && (
              <p role="status">Đang kiểm tra giá và tồn kho mới nhất...</p>
            )}
            {items.map((item) => {
              const product = productsById[item.productId];
              const productCheckComplete = Object.prototype.hasOwnProperty.call(
                productsById,
                item.productId
              );
              const sizes = product?.sizes || [];
              const colors = product?.colors || [];
              const otherVariantQuantity = items.reduce(
                (quantity, otherItem) =>
                  otherItem.productId === item.productId &&
                  !isSameLine(otherItem, item)
                    ? quantity + Number(otherItem.quantity || 0)
                    : quantity,
                0
              );
              const productQuantity =
                otherVariantQuantity + Number(item.quantity || 0);
              const stockExceeded =
                product && productQuantity > Number(product.stock);
              const currentPrice = Number(product?.price ?? item.price);
              const priceAtAdd = Number(item.priceAtAdd ?? item.price);
              const priceChanged =
                product && currentPrice !== priceAtAdd;
              const sizeUnavailable = product
                ? sizes.length
                  ? !sizes.includes(item.size || "")
                  : Boolean(item.size)
                : false;
              const colorUnavailable = product
                ? colors.length
                  ? !colors.includes(item.color || "")
                  : Boolean(item.color)
                : false;
              const productUnavailable =
                productCheckComplete &&
                (!product ||
                  !product.isActive ||
                  Number(product.stock) < 1 ||
                  sizeUnavailable ||
                  colorUnavailable);
              const maxQuantity = Math.min(
                99,
                Math.max(
                  1,
                  Number(product?.stock ?? item.stock) - otherVariantQuantity
                )
              );

              return (
                <article className="cart-item" key={cartLineKey(item)}>
                  {item.image ? (
                    <img
                      className="cart-item-image"
                      src={item.image}
                      alt={item.name}
                    />
                  ) : (
                    <div className="cart-item-image cart-image-placeholder">
                      MODENA
                    </div>
                  )}

                  <div className="cart-item-info">
                    <h2>{item.name}</h2>
                    <p>{formatPrice(currentPrice)}</p>
                    {priceChanged && (
                      <p className="cart-variant-warning" role="status">
                        Giá đã thay đổi từ {formatPrice(priceAtAdd)} thành{" "}
                        {formatPrice(currentPrice)}. Tổng tiền đã cập nhật theo
                        giá hiện tại.
                      </p>
                    )}

                    {sizes.length > 0 || item.size ? (
                      <label className="cart-variant-field">
                        Kích thước
                        <select
                          value={item.size || ""}
                          disabled={isCartSyncing}
                          onChange={(event) =>
                            updateVariant(
                              item.productId,
                              item.size || "",
                              item.color || "",
                              event.target.value,
                              item.color || ""
                            )
                          }
                        >
                          {sizes.length > 0 && !item.size && (
                            <option value="" disabled>
                              Chọn kích thước
                            </option>
                          )}
                          {sizes.length === 0 && (
                            <option value="">Không chọn kích thước</option>
                          )}
                          {item.size && !sizes.includes(item.size) && (
                            <option value={item.size}>
                              {item.size} (không còn khả dụng)
                            </option>
                          )}
                          {sizes.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      item.size && <p>Kích thước: {item.size}</p>
                    )}

                    {colors.length > 0 || item.color ? (
                      <label className="cart-variant-field">
                        Màu sắc
                        <select
                          value={item.color || ""}
                          disabled={isCartSyncing}
                          onChange={(event) =>
                            updateVariant(
                              item.productId,
                              item.size || "",
                              item.color || "",
                              item.size || "",
                              event.target.value
                            )
                          }
                        >
                          {colors.length > 0 && !item.color && (
                            <option value="" disabled>
                              Chọn màu sắc
                            </option>
                          )}
                          {colors.length === 0 && (
                            <option value="">Không chọn màu sắc</option>
                          )}
                          {item.color && !colors.includes(item.color) && (
                            <option value={item.color}>
                              {item.color} (không còn khả dụng)
                            </option>
                          )}
                          {colors.map((color) => (
                            <option key={color} value={color}>
                              {color}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      item.color && <p>Màu sắc: {item.color}</p>
                    )}

                    {productUnavailable && (
                      <p className="cart-variant-warning" role="alert">
                        {!product
                          ? "Không tải được sản phẩm hoặc sản phẩm đã ngừng bán. Hãy kiểm tra lại hoặc xóa khỏi giỏ hàng."
                          : Number(product.stock) < 1
                            ? "Sản phẩm đã hết hàng. Hãy xóa khỏi giỏ hàng để tiếp tục."
                            : sizeUnavailable || colorUnavailable
                              ? "Lựa chọn kích thước hoặc màu sắc không còn khả dụng. Hãy chọn lại hoặc xóa sản phẩm."
                              : "Sản phẩm đã ngừng kinh doanh. Hãy xóa khỏi giỏ hàng để tiếp tục."}
                      </p>
                    )}
                    {stockExceeded && (
                      <p className="cart-variant-warning" role="alert">
                        Tổng số lượng sản phẩm vượt quá tồn kho hiện tại.
                        Hãy giảm số lượng trước khi đặt hàng.
                      </p>
                    )}

                    <div className="cart-quantity">
                      <button
                        type="button"
                        aria-label={`Giảm số lượng ${item.name}`}
                        disabled={isCartSyncing || item.quantity <= 1}
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.size || "",
                            item.color || "",
                            item.quantity - 1
                          )
                        }
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        aria-label={`Tăng số lượng ${item.name}`}
                        disabled={isCartSyncing || item.quantity >= maxQuantity}
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.size || "",
                            item.color || "",
                            item.quantity + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-end">
                    <strong>{formatPrice(currentPrice * item.quantity)}</strong>
                    <button
                      className="cart-remove-button"
                      type="button"
                      disabled={isCartSyncing}
                      onClick={() =>
                        removeItem(
                          item.productId,
                          item.size || "",
                          item.color || ""
                        )
                      }
                    >
                      Xóa
                    </button>
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="cart-summary">
            <h2>Tóm tắt đơn hàng</h2>
            <p>
              <span>Tổng cộng</span>
              <strong>{formatPrice(total)}</strong>
            </p>
            <Link
              className={`checkout-button${cartHasIssues || isCartSyncing ? " is-disabled" : ""}`}
              to="/checkout"
              aria-disabled={cartHasIssues || isCartSyncing}
              onClick={(event) => {
                if (cartHasIssues || isCartSyncing) event.preventDefault();
              }}
            >
              Tiến hành đặt hàng
            </Link>
            {cartHasIssues && !areProductsBeingChecked && (
              <div className="cart-variant-warning" role="alert">
                <p>
                  Hãy xử lý sản phẩm không khả dụng hoặc vượt tồn kho trước khi
                  đặt hàng.
                </p>
                <button
                  className="cart-recheck-button"
                  type="button"
                  onClick={() => {
                    setCheckedProductIdsKey("");
                    setProductCheckAttempt((attempt) => attempt + 1);
                  }}
                >
                  Kiểm tra lại giá và tồn kho
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
