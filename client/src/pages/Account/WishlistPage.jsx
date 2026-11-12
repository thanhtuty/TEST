import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router";
import ProductCard from "../../components/ProductCard/ProductCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getWishlist, removeWishlistItem } from "../../services/wishlistService.js";
import "./WishlistPage.css";

export default function WishlistPage() {
  const { user, token, isAuthLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingProductId, setRemovingProductId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    if (!token) {
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    getWishlist(token)
      .then((data) => {
        if (active) setProducts(data);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message || "Không thể tải danh sách yêu thích.");
        }
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
      <main className="wishlist-page">
        <p role="status">Đang kiểm tra tài khoản...</p>
      </main>
    );
  }

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  async function handleRemove(productId) {
    setError("");
    setRemovingProductId(productId);

    try {
      const updatedProducts = await removeWishlistItem(token, productId);
      setProducts(updatedProducts);
    } catch (requestError) {
      setError(requestError.message || "Không thể xóa sản phẩm.");
    } finally {
      setRemovingProductId("");
    }
  }

  return (
    <main className="wishlist-page">
      <header className="wishlist-heading">
        <div>
          <p className="wishlist-eyebrow">TÀI KHOẢN</p>
          <h1>Sản phẩm yêu thích</h1>
        </div>
        <Link to="/">Tiếp tục mua sắm</Link>
      </header>

      {isLoading && <p role="status">Đang tải danh sách...</p>}
      {error && <p className="wishlist-error" role="alert">{error}</p>}

      {!isLoading && !error && products.length === 0 && (
        <section className="wishlist-empty">
          <p>Bạn chưa lưu sản phẩm yêu thích nào.</p>
          <Link to="/">Khám phá sản phẩm</Link>
        </section>
      )}

      {!isLoading && products.length > 0 && (
        <div className="wishlist-grid">
          {products.map((product) => (
            <article className="wishlist-item" key={product._id}>
              <ProductCard product={product} />
              <button
                type="button"
                onClick={() => handleRemove(product._id)}
                disabled={removingProductId === product._id}
              >
                {removingProductId === product._id
                  ? "Đang xóa..."
                  : "Xóa khỏi yêu thích"}
              </button>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
