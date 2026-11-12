import { Link } from "react-router";
import "./StoreInformation.css";

const measurements = [
  {
    title: "Vòng ngực",
    description:
      "Đặt thước quanh phần đầy nhất của ngực, giữ thước ngang và vừa sát cơ thể.",
  },
  {
    title: "Vòng eo",
    description:
      "Đo quanh phần nhỏ nhất của eo tự nhiên; thở bình thường và không siết thước.",
  },
  {
    title: "Vòng hông",
    description:
      "Khép chân tự nhiên rồi đo quanh phần rộng nhất của hông.",
  },
  {
    title: "Chiều dài",
    description:
      "Với quần hoặc váy, đo chiều dài mong muốn và đối chiếu mô tả kiểu dáng của sản phẩm.",
  },
];

export default function SizeGuidePage() {
  return (
    <main className="store-info-page">
      <header className="store-info-heading">
        <p className="store-info-eyebrow">TƯ VẤN MUA SẮM</p>
        <h1>Hướng dẫn chọn kích thước</h1>
        <p>
          Đo cơ thể trước khi chọn size để dễ đối chiếu hơn với kiểu dáng của
          từng sản phẩm.
        </p>
      </header>

      <section className="store-info-section">
        <div className="store-info-section-heading">
          <span>01</span>
          <div>
            <h2>Cách lấy số đo</h2>
            <p>Dùng thước dây mềm và giữ thước nằm ngang.</p>
          </div>
        </div>

        <div className="size-measure-grid">
          {measurements.map((measurement) => (
            <article className="size-measure-card" key={measurement.title}>
              <h3>{measurement.title}</h3>
              <p>{measurement.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="store-info-section">
        <div className="store-info-section-heading">
          <span>02</span>
          <div>
            <h2>Chọn size trên MODENA</h2>
            <p>Size và form có thể khác nhau giữa các mẫu.</p>
          </div>
        </div>

        <div className="store-info-note">
          <p>
            Trang sản phẩm hiển thị các kích thước hiện có. Hiện website chưa
            có bảng số đo theo centimet riêng cho từng mẫu, vì vậy hãy xem kỹ
            mô tả sản phẩm và chọn theo form bạn thường mặc. Nếu còn phân vân,
            hãy liên hệ shop trước khi đặt hàng.
          </p>
        </div>
      </section>

      <nav className="store-info-links" aria-label="Thông tin mua sắm">
        <Link to="/">← Quay lại sản phẩm</Link>
        <Link to="/shipping-returns">Giao hàng và đổi trả →</Link>
      </nav>
    </main>
  );
}
