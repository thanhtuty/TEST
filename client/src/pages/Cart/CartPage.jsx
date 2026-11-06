import { Link } from "react-router";
import { useCart } from "../../context/CartContext.jsx";
import "./CartPage.css";

function formatPrice(price) {
    return `${Number(price).toLocaleString("vi-VN")} ₫`;
}

export default function CartPage() {
    const { items, removeItem, updateQuantity } = useCart();

    const total = items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
    );

    return (
        <main className="cart-page">
            <header className="cart-heading">
                <h1>Giỏ hàng</h1>
                <Link to="/">Tiếp tục mua sắm</Link>
            </header>

            {items.length === 0 ? (
                <p>Giỏ hàng đang trống.</p>
            ) : (
                <div className="cart-layout">
                    <section className="cart-items" aria-label="Sản phẩm trong giỏ">
                        {items.map((item) => (
                            <article className="cart-item" key={item.productId}>
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
                                    <p>{formatPrice(item.price)}</p>

                                    <div className="cart-quantity">
                                        <button
                                            type="button"
                                            aria-label={`Giảm số lượng ${item.name}`}
                                            disabled={item.quantity <= 1}
                                            onClick={() =>
                                                updateQuantity(item.productId, item.quantity - 1)
                                            }
                                        >
                                            −
                                        </button>

                                        <span>{item.quantity}</span>

                                        <button
                                            type="button"
                                            aria-label={`Tăng số lượng ${item.name}`}
                                            disabled={item.quantity >= item.stock}
                                            onClick={() =>
                                                updateQuantity(item.productId, item.quantity + 1)
                                            }
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="cart-item-end">
                                    <strong>
                                        {formatPrice(Number(item.price) * item.quantity)}
                                    </strong>
                                    <button
                                        className="cart-remove-button"
                                        type="button"
                                        onClick={() => removeItem(item.productId)}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </article>
                        ))}
                    </section>

                    <aside className="cart-summary">
                        <h2>Tóm tắt đơn hàng</h2>
                        <p>
                            <span>Tổng cộng</span>
                            <strong>{formatPrice(total)}</strong>

                        </p>
                        <Link className="checkout-button" to="/checkout">
                            Tiến hành đặt hàng
                        </Link>
                    </aside>
                </div>
            )}
        </main>
    );
}
