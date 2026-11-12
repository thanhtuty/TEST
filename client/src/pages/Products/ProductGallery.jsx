import { useState } from "react";

export default function ProductGallery({ images = [], name }) {
  const availableImages = images.filter(Boolean);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = availableImages[selectedIndex];

  return (
    <div className="product-gallery">
      <div className="product-detail-image">
        {selectedImage ? (
          <img src={selectedImage} alt={name} />
        ) : (
          <div className="product-image-placeholder">MODENA</div>
        )}
      </div>

      {availableImages.length > 1 && (
        <div className="product-gallery-thumbnails" aria-label="Ảnh sản phẩm">
          {availableImages.map((image, index) => (
            <button
              className={index === selectedIndex ? "is-selected" : ""}
              type="button"
              key={`${image}-${index}`}
              aria-label={`Xem ảnh ${index + 1} của ${name}`}
              aria-pressed={index === selectedIndex}
              onClick={() => setSelectedIndex(index)}
            >
              <img src={image} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
