export default function ProductFilters({
  searchText,
  size,
  color,
  minPrice,
  maxPrice,
  sortBy,
  sizes,
  colors,
  onFilterChange,
  onClear,
  hasActiveFilters,
  countMessage,
}) {
  return (
    <section
      className="products-toolbar"
      aria-label="Tìm kiếm và lọc sản phẩm"
    >
      <label className="products-search-field">
        <span>Tìm kiếm</span>
        <input
          type="search"
          value={searchText}
          onChange={(event) => onFilterChange("q", event.target.value)}
          placeholder="Tên, danh mục hoặc mô tả sản phẩm"
        />
      </label>

      <div className="products-filter-grid">
        <label className="products-filter-field">
          <span>Kích thước</span>
          <select
            value={size}
            onChange={(event) => onFilterChange("size", event.target.value)}
          >
            <option value="">Tất cả kích thước</option>
            {sizes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="products-filter-field">
          <span>Màu sắc</span>
          <select
            value={color}
            onChange={(event) => onFilterChange("color", event.target.value)}
          >
            <option value="">Tất cả màu sắc</option>
            {colors.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <div className="products-price-filter">
          <span>Khoảng giá</span>
          <div>
            <label>
              <span className="visually-hidden">Giá thấp nhất</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={minPrice}
                onChange={(event) =>
                  onFilterChange("minPrice", event.target.value)
                }
                placeholder="Từ"
              />
            </label>
            <label>
              <span className="visually-hidden">Giá cao nhất</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={maxPrice}
                onChange={(event) =>
                  onFilterChange("maxPrice", event.target.value)
                }
                placeholder="Đến"
              />
            </label>
          </div>
        </div>

        <label className="products-filter-field">
          <span>Sắp xếp</span>
          <select
            value={sortBy}
            onChange={(event) => onFilterChange("sort", event.target.value)}
          >
            <option value="default">Mặc định</option>
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="price-desc">Giá cao đến thấp</option>
            <option value="name-asc">Tên A–Z</option>
          </select>
        </label>
      </div>

      <div className="products-toolbar-footer">
        <p aria-live="polite">{countMessage}</p>
        <button
          type="button"
          className="products-clear-button"
          onClick={onClear}
          disabled={!hasActiveFilters}
        >
          Xóa bộ lọc
        </button>
      </div>
    </section>
  );
}
