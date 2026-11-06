import { useEffect, useState } from "react";
import { getProducts } from "../../services/productService.js";
import "./ProductsPage.css";
import ProductCard from "../../components/ProductCard/ProductCard.jsx";
function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts()
        setProducts(data)
      } catch (error) {
        setError(error.message);

      } finally {
        setLoading(false)
      }

    }
    fetchProducts()
  }, [])
  return (
    <section className="products-page">
      <h1>Sản phẩm</h1>
      {loading && <p>Đang tải sản phẩm...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && products.length === 0 && (
        <p>Chưa có sản phẩm.</p>
      )}
      {!loading && !error && products.length > 0 && (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

    </section>
  )

}
export default ProductsPage