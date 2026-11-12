import { Link } from "react-router";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <section className="not-found-card" aria-labelledby="not-found-title">
        <p className="not-found-code">404 · MODENA</p>
        <h1 id="not-found-title">Không tìm thấy trang này</h1>
        <p>
          Đường dẫn có thể đã thay đổi hoặc không còn tồn tại. Bạn có thể quay
          lại cửa hàng để tiếp tục xem sản phẩm.
        </p>
        <Link className="not-found-home-link" to="/">
          Về trang sản phẩm
        </Link>
      </section>
    </main>
  );
}
