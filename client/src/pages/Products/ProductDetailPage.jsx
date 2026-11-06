import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getProductById } from "../../services/productService.js";
import "./ProductDetailPage.css";
import { useCart } from "../../context/CartContext.jsx";
export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { items, addItem } = useCart();
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) return <p>Đang tải sản phẩm...</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!product) return <p>Không tìm thấy sản phẩm.</p>;
  const cartItem = items.find((item) => item.productId === product._id);
  const maxReached = cartItem && cartItem.quantity >= product.stock;
  return (
    <section className="product-detail">
      <div className="product-detail-image">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} />
        ) : (
          <div className="product-image-placeholder">MODENA</div>
        )}
      </div>

      <div className="product-detail-info">
        <p className="product-detail-category">{product.category}</p>
        <h1>{product.name}</h1>
        <p className="product-detail-price">{Number(product.price).toLocaleString("vi-VN")} ₫</p>
        <p className="product-detail-description">{product.description || "Chưa có mô tả."}</p>
        <div className="product-detail-attribute">
          <p>Kích thước</p>
          <div className="product-detail-options">
            {product.sizes?.length
              ? product.sizes.map((size) => <span key={size}>{size}</span>)
              : <span>Chưa cập nhật</span>}
          </div>
        </div>

        <div className="product-detail-attribute">
          <p>Màu sắc</p>
          <div className="product-detail-options">
            {product.colors?.length
              ? product.colors.map((color) => <span key={color}>{color}</span>)
              : <span>Chưa cập nhật</span>}
          </div>
        </div>
        <p className={`product-detail-stock ${product.isActive && product.stock > 0
          ? "is-available"
          : "is-unavailable"
          }`}>
          {!product.isActive
            ? "Sản phẩm ngừng kinh doanh"
            : product.stock > 0
              ? `Còn hàng (${product.stock})`
              : "Hết hàng"}
        </p>
        <button
          type="button"
          disabled={!product.isActive || product.stock <= 0 || maxReached}
          onClick={() => {
            addItem(product);
            setCartMessage("Đã thêm sản phẩm vào giỏ hàng.");
          }}
        >
          {product.stock <= 0
            ? "Hết hàng"
            : maxReached
              ? "Đã đạt số lượng tối đa"
              : "Thêm vào giỏ"}
        </button>

        {cartMessage && <p role="status">{cartMessage}</p>}
      </div>
    </section>
  );
}