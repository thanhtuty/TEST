export default function CategoryNavigation({
  categories,
  selectedCategory,
  onSelect,
}) {
  return (
    <nav className="category-navigation" aria-label="Danh mục sản phẩm">
      <button
        className={!selectedCategory ? "is-active" : ""}
        type="button"
        aria-pressed={!selectedCategory}
        onClick={() => onSelect("")}
      >
        Tất cả sản phẩm
      </button>

      {categories.map((category) => (
        <button
          className={selectedCategory === category ? "is-active" : ""}
          type="button"
          key={category}
          aria-pressed={selectedCategory === category}
          onClick={() => onSelect(category)}
        >
          {category}
        </button>
      ))}
    </nav>
  );
}
