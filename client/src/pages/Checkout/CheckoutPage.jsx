import { Link } from "react-router";
import { useCart } from "../../context/CartContext.jsx";
import { createOrder } from "../../services/orderService.js";
import "./CheckoutPage.css";
import { useEffect, useState } from "react";
import { getProductById } from "../../services/productService.js";
function formatPrice(price) {
    return `${Number(price).toLocaleString("vi-VN")} ₫`;
}

export default function CheckoutPage() {
    const { items, clearCart } = useCart();
    const [customer, setCustomer] = useState({
        fullName: "",
        phone: "",
        address: "",
        note: "",
    });
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [order, setOrder] = useState(null);
    const [currentProducts, setCurrentProducts] = useState([]);
    const [isRefreshingCart, setIsRefreshingCart] = useState(true);
    const [inventoryError, setInventoryError] = useState("");
    useEffect(() => {
        let active = true;

        async function refreshCartProducts() {
            if (items.length === 0) {
                setCurrentProducts([]);
                setIsRefreshingCart(false);
                return;
            }

            setIsRefreshingCart(true);
            setInventoryError("");

            try {
                const products = await Promise.all(
                    items.map((item) => getProductById(item.productId))
                );

                if (!active) return;

                setCurrentProducts(products);

                const insufficientItems = items.filter((item) => {
                    const product = products.find(
                        (current) => current._id === item.productId
                    );

                    return !product || Number(product.stock) < item.quantity;
                });

                if (insufficientItems.length > 0) {
                    setInventoryError(
                        "Một số sản phẩm không còn đủ hàng. Hãy quay lại giỏ hàng để cập nhật."
                    );
                }
            } catch {
                if (active) {
                    setCurrentProducts([]);
                    setInventoryError(
                        "Không thể cập nhật giá và tồn kho. Hãy tải lại trang thử nhé."
                    );
                }
            } finally {
                if (active) setIsRefreshingCart(false);
            }
        }

        refreshCartProducts();

        return () => {
            active = false;
        };
    }, [items]);
    const checkoutItems = items.map((item) => {
        const product = currentProducts.find(
            (current) => current._id === item.productId
        );

        return {
            ...item,
            currentPrice: product?.price ?? item.price,
        };
    });

    const total = checkoutItems.reduce(
        (sum, item) => sum + Number(item.currentPrice) * item.quantity,
        0
    );

    function handleChange(event) {
        const { name, value } = event.target;
        setCustomer((current) => ({
            ...current,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const createdOrder = await createOrder({
                customer,
                items: items.map(({ productId, quantity }) => ({
                    productId,
                    quantity,
                })),
            });

            setOrder(createdOrder);
            clearCart();
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (order) {
        return (
            <main className="checkout-page">
                <h1>Đặt hàng thành công</h1>
                <p>Cảm ơn {order.customer.fullName}.</p>
                <p>Mã đơn hàng: {order._id}</p>
                <p>Tổng cộng: {formatPrice(order.totalAmount)}</p>
                <p>Thanh toán khi nhận hàng (COD).</p>
                <Link to="/">Tiếp tục mua sắm</Link>
            </main>
        );
    }

    if (items.length === 0) {
        return (
            <main className="checkout-page">
                <h1>Giỏ hàng đang trống</h1>
                <Link to="/">Xem sản phẩm</Link>
            </main>
        );
    }

    return (
        <main className="checkout-page">
            <h1>Thông tin đặt hàng</h1>
            <Link to="/cart">Quay lại giỏ hàng</Link>

            <div className="checkout-layout">
                <form onSubmit={handleSubmit}>
                    <h2>Thông tin giao hàng</h2>

                    <label>
                        Họ và tên
                        <input
                            name="fullName"
                            value={customer.fullName}
                            onChange={handleChange}
                            minLength={2}
                            maxLength={100}
                            autoComplete="name"
                            required
                        />
                    </label>

                    <label>
                        Số điện thoại
                        <input
                            name="phone"
                            type="tel"
                            value={customer.phone}
                            onChange={handleChange}
                            maxLength={20}
                            autoComplete="tel"
                            required
                        />
                    </label>

                    <label>
                        Địa chỉ nhận hàng
                        <textarea
                            name="address"
                            value={customer.address}
                            onChange={handleChange}
                            minLength={8}
                            maxLength={300}
                            autoComplete="street-address"
                            required
                        />
                    </label>

                    <label>
                        Ghi chú (không bắt buộc)
                        <textarea
                            name="note"
                            value={customer.note}
                            onChange={handleChange}
                            maxLength={500}
                        />
                    </label>

                    <p>Phương thức thanh toán: COD</p>

                    {isRefreshingCart && (
                        <p role="status">Đang kiểm tra sản phẩm...</p>
                    )}
                    {inventoryError && (
                        <p role="alert">{inventoryError}</p>
                    )}
                    {error && <p role="alert">{error}</p>}
                    <button
                        type="submit"
                        disabled={isSubmitting || isRefreshingCart || Boolean(inventoryError)}
                    >
                        {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
                    </button>
                </form>

                <aside>
                    {isRefreshingCart ? (
                        <p role="status">Đang cập nhật giá và tồn kho...</p>
                    ) : currentProducts.length === 0 ? (
                        <p>Không tải được giá hiện tại. Hãy thử tải lại trang.</p>
                    ) : (
                        <>
                            {checkoutItems.map((item) => (
                                <p key={item.productId}>
                                    {item.name} × {item.quantity}
                                    {" — "}
                                    {formatPrice(Number(item.currentPrice) * item.quantity)}
                                </p>
                            ))}

                            <strong>Tổng cộng: {formatPrice(total)}</strong>
                        </>)}
                </aside>
            </div>
        </main>
    );
}