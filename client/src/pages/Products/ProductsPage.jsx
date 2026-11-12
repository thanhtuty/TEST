import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { getProducts } from "../../services/productService.js";
import ProductCard from "../../components/ProductCard/ProductCard.jsx";
import CategoryNavigation from "./CategoryNavigation.jsx";
import ProductFilters from "./ProductFilters.jsx";
import ProductPagination from "./ProductPagination.jsx";
import "./ProductsPage.css";

const PAGE_SIZE = 8;
const SORT_OPTIONS = new Set([
  "default",
  "newest",
  "price-asc",
  "price-desc",
  "name-asc",
]);

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d");
}

function getUniqueValues(products, field) {
  const values = products.flatMap((product) =>
    Array.isArray(product[field]) ? product[field] : []
  );

  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b), "vi")
  );
}

function parsePage(value) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const searchText = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const size = searchParams.get("size") || "";
  const color = searchParams.get("color") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const requestedSort = searchParams.get("sort") || "default";
  const sortBy = SORT_OPTIONS.has(requestedSort) ? requestedSort : "default";
  const requestedPage = parsePage(searchParams.get("page"));

  useEffect(() => {
    let active = true;

    async function fetchProducts() {
      try {
        const data = await getProducts();
        if (active) setProducts(data);
      } catch (requestError) {
        if (active) setError(requestError.message || "Không thể tải sản phẩm.");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      active = false;
    };
  }, []);

  const categories = [
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, "vi"));
  const sizes = getUniqueValues(products, "sizes");
  const colors = getUniqueValues(products, "colors");

  const minPriceValue = minPrice.trim() === "" ? null : Number(minPrice);
  const maxPriceValue = maxPrice.trim() === "" ? null : Number(maxPrice);
  const hasInvalidPrice =
    (minPriceValue !== null &&
      (!Number.isFinite(minPriceValue) || minPriceValue < 0)) ||
    (maxPriceValue !== null &&
      (!Number.isFinite(maxPriceValue) || maxPriceValue < 0));
  const priceRangeError = hasInvalidPrice
    ? "Giá phải là số không âm."
    : minPriceValue !== null &&
        maxPriceValue !== null &&
        minPriceValue > maxPriceValue
      ? "Giá thấp nhất không thể lớn hơn giá cao nhất."
      : "";

  const normalizedQuery = normalizeText(searchText.trim());
  const filteredProducts = priceRangeError
    ? []
    : products.filter((product) => {
        const searchableText = normalizeText(
          [product.name, product.category, product.description]
            .filter(Boolean)
            .join(" ")
        );
        const price = Number(product.price);

        return (
          searchableText.includes(normalizedQuery) &&
          (!category || product.category === category) &&
          (!size || (Array.isArray(product.sizes) && product.sizes.includes(size))) &&
          (!color ||
            (Array.isArray(product.colors) && product.colors.includes(color))) &&
          (minPriceValue === null || price >= minPriceValue) &&
          (maxPriceValue === null || price <= maxPriceValue)
        );
      });

  const sortedProducts = [...filteredProducts];
  if (sortBy === "price-asc") {
    sortedProducts.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sortBy === "price-desc") {
    sortedProducts.sort((a, b) => Number(b.price) - Number(a.price));
  } else if (sortBy === "newest") {
    sortedProducts.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );
  } else if (sortBy === "name-asc") {
    sortedProducts.sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""), "vi")
    );
  }

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const visibleProducts = sortedProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const firstVisibleProduct = sortedProducts.length
    ? (currentPage - 1) * PAGE_SIZE + 1
    : 0;
  const lastVisibleProduct = Math.min(
    currentPage * PAGE_SIZE,
    sortedProducts.length
  );

  useEffect(() => {
    if (loading || requestedPage === currentPage) return;

    const nextParams = new URLSearchParams(searchParams);
    if (currentPage === 1) nextParams.delete("page");
    else nextParams.set("page", String(currentPage));
    setSearchParams(nextParams, { replace: true });
  }, [currentPage, loading, requestedPage, searchParams, setSearchParams]);

  function updateFilter(name, value) {
    const nextParams = new URLSearchParams(searchParams);
    const nextValue = String(value ?? "");

    if (nextValue.trim() === "") nextParams.delete(name);
    else nextParams.set(name, nextValue);

    nextParams.delete("page");
    setSearchParams(nextParams, { replace: true });
  }

  function selectCategory(nextCategory) {
    updateFilter("category", nextCategory);
  }

  function goToPage(page) {
    const nextParams = new URLSearchParams(searchParams);
    if (page <= 1) nextParams.delete("page");
    else nextParams.set("page", String(page));
    setSearchParams(nextParams);
  }

  function clearFilters() {
    setSearchParams({}, { replace: true });
  }

  const hasActiveFilters = Boolean(
    searchText ||
      category ||
      size ||
      color ||
      minPrice ||
      maxPrice ||
      (requestedSort && requestedSort !== "default")
  );

  return (
    <section className="products-page">
      <header className="products-heading">
        <div>
          <p className="products-eyebrow">MODENA</p>
          <h1>Sản phẩm</h1>
          <p className="products-heading-description">
            Khám phá những thiết kế phù hợp với phong cách của bạn.
          </p>
        </div>
      </header>

      <CategoryNavigation
        categories={categories}
        selectedCategory={category}
        onSelect={selectCategory}
      />

      <ProductFilters
        searchText={searchText}
        size={size}
        color={color}
        minPrice={minPrice}
        maxPrice={maxPrice}
        sortBy={sortBy}
        sizes={sizes}
        colors={colors}
        onFilterChange={updateFilter}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
        countMessage={
          loading
            ? "Đang tải sản phẩm..."
            : `Hiển thị ${firstVisibleProduct}–${lastVisibleProduct} / ${sortedProducts.length} sản phẩm`
        }
      />

      {priceRangeError && (
        <p className="products-error" role="alert">
          {priceRangeError}
        </p>
      )}
      {error && (
        <p className="products-error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && !priceRangeError && visibleProducts.length === 0 && (
        <p className="products-empty">
          {products.length === 0
            ? "Chưa có sản phẩm. Hãy quay lại sau nhé."
            : "Không tìm thấy sản phẩm phù hợp. Hãy thử thay đổi bộ lọc."}
        </p>
      )}

      {!loading && !error && visibleProducts.length > 0 && (
        <>
          <div className="products-grid" aria-live="polite">
            {visibleProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <ProductPagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </>
      )}
    </section>
  );
}
