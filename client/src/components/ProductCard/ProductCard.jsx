import "./ProductCard.css";
import { Link } from "react-router";
export default function ProductCard({ product }) {
  return (
    <>
      <Link
        to={`/products/${product._id}`}
        className="product-card-link"
      >
        <article className="product-card">
          <div className="product-image">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} />
            ) : (
              <div className="product-image-placeholder">MODENA</div>
            )}
          </div>

          <div className="product-info">
            <p className="product-category">{product.category}</p>
            <h2>{product.name}</h2>
            <p className="product-price">
              {Number(product.price).toLocaleString("vi-VN")} ₫
            </p>
          </div>
        </article>
      </Link>
    </>

  );
}