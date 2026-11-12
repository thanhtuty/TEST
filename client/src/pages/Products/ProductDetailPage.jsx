import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { getProductById } from "../../services/productService.js";
import ProductGallery from "./ProductGallery.jsx";
import "./ProductDetailPage.css";
import { useCart } from "../../context/CartContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  addWishlistItem,
  getWishlist,
  removeWishlistItem,
} from "../../services/wishlistService.js";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const {
    items,
    addItem,
    isCartSyncing,
    cartSyncError,
    retryCartSync,
  } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [cartMessage, setCartMessage] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isUpdatingWishlist, setIsUpdatingWishlist] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");
        setProduct(null);
        setSelectedSize("");
        setSelectedColor("");

        const data = await getProductById(id);

        if (active) setProduct(data);
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    let active = true;

    if (!token) {
      setIsFavorite(false);
      setWishlistMessage("");
      return () => {
        active = false;
      };
    }

    getWishlist(token)
      .then((products) => {
        if (active) {
          setIsFavorite(products.some((item) => item._id === id));
        }
      })
      .catch(() => {
        if (active) setWishlistMessage("Chưa tải được trạng thái yêu thích.");
      });

    return () => {
      active = false;
    };
  }, [id, token]);

  if (loading) return <p>Đang tải sản phẩm...</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!product) return <p>Không tìm thấy sản phẩm.</p>;

  const sizes = product.sizes || [];
  const colors = product.colors || [];

  const missingSelection =
    (sizes.length > 0 && !selectedSize) ||
    (colors.length > 0 && !selectedColor);

  const productQuantityInCart = items
    .filter((item) => item.productId === product._id)
    .reduce((total, item) => total + Number(item.quantity || 0), 0);
  const selectedVariantQuantity = items
    .filter(
      (item) =>
        item.productId === product._id &&
        (item.size || "") === selectedSize &&
        (item.color || "") === selectedColor
    )
    .reduce((total, item) => total + Number(item.quantity || 0), 0);

  const maxReached =
    productQuantityInCart >= Number(product.stock) ||
    selectedVariantQuantity >= 99;

  function handleAddToCart() {
    addItem({
      ...product,
      selectedSize,
      selectedColor,
    });
    setCartMessage("Đã thêm sản phẩm vào giỏ hàng.");
  }

  async function handleToggleWishlist() {
    if (!token) {
      navigate("/login");
      return;
    }

    setIsUpdatingWishlist(true);
    setWishlistMessage("");

    try {
      if (isFavorite) {
        await removeWishlistItem(token, product._id);
        setIsFavorite(false);
        setWishlistMessage("Đã xóa khỏi danh sách yêu thích.");
      } else {
        await addWishlistItem(token, product._id);
        setIsFavorite(true);
        setWishlistMessage("Đã thêm vào danh sách yêu thích.");
      }
    } catch (requestError) {
      setWishlistMessage(requestError.message || "Không thể cập nhật yêu thích.");
    } finally {
      setIsUpdatingWishlist(false);
    }
  }

  return (
    <section className="product-detail">
      <ProductGallery
        key={product._id}
        images={product.images || []}
        name={product.name}
      />

      <div className="product-detail-info">
        <p className="product-detail-category">{product.category}</p>
        <h1>{product.name}</h1>
        <p className="product-detail-price">
          {Number(product.price).toLocaleString("vi-VN")} ₫
        </p>
        <p className="product-detail-description">
          {product.description || "Chưa có mô tả."}
        </p>

        <div className="product-detail-attribute">
          <p>Kích thước</p>
          <div
            className="product-detail-options"
            role="group"
            aria-label="Chọn kích thước"
          >
            {sizes.length > 0 ? (
              sizes.map((size) => (
                <button
                  className={`product-detail-option ${
                    selectedSize === size ? "is-selected" : ""
                  }`}
                  type="button"
                  key={size}
                  aria-pressed={selectedSize === size}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))
            ) : (
              <span>Chưa cập nhật</span>
            )}
          </div>
          <Link className="product-size-guide-link" to="/size-guide">
            Xem hướng dẫn chọn size
          </Link>
        </div>

        <div className="product-detail-attribute">
          <p>Màu sắc</p>
          <div
            className="product-detail-options"
            role="group"
            aria-label="Chọn màu sắc"
          >
            {colors.length > 0 ? (
              colors.map((color) => (
                <button
                  className={`product-detail-option ${
                    selectedColor === color ? "is-selected" : ""
                  }`}
                  type="button"
                  key={color}
                  aria-pressed={selectedColor === color}
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </button>
              ))
            ) : (
              <span>Chưa cập nhật</span>
            )}
          </div>
        </div>

        <p
          className={`product-detail-stock ${
            product.isActive && product.stock > 0
              ? "is-available"
              : "is-unavailable"
          }`}
        >
          {!product.isActive
            ? "Sản phẩm ngừng kinh doanh"
            : product.stock > 0
              ? `Còn hàng (${product.stock})`
              : "Hết hàng"}
        </p>

        {cartSyncError && (
          <div role="alert">
            <p>Không thể đồng bộ giỏ hàng: {cartSyncError}</p>
            <button type="button" onClick={retryCartSync}>
              Thử đồng bộ lại
            </button>
          </div>
        )}

        {user ? (
          <button
            className="product-detail-wishlist"
            type="button"
            onClick={handleToggleWishlist}
            disabled={isUpdatingWishlist}
          >
            {isUpdatingWishlist
              ? "Đang cập nhật..."
              : isFavorite
                ? "♥ Đã yêu thích"
                : "♡ Thêm vào yêu thích"}
          </button>
        ) : (
          <Link className="product-detail-wishlist" to="/login">
            Đăng nhập để lưu yêu thích
          </Link>
        )}

        {wishlistMessage && <p role="status">{wishlistMessage}</p>}

        <button
          type="button"
          disabled={
            isCartSyncing ||
            !product.isActive ||
            product.stock <= 0 ||
            maxReached ||
            missingSelection
          }
          onClick={handleAddToCart}
        >
          {isCartSyncing
            ? "Đang đồng bộ giỏ hàng..."
            : product.stock <= 0
              ? "Hết hàng"
              : maxReached
                ? "Đã đạt số lượng tối đa"
                : missingSelection
                  ? "Chọn kích thước và màu sắc"
                  : "Thêm vào giỏ"}
        </button>

        {cartMessage && <p role="status">{cartMessage}</p>}
      </div>
    </section>
  );
}
