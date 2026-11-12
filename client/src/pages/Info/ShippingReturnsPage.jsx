import { Link } from "react-router";
import "./StoreInformation.css";

export default function ShippingReturnsPage() {
  return (
    <main className="store-info-page">
      <header className="store-info-heading">
        <p className="store-info-eyebrow">THÔNG TIN ĐƠN HÀNG</p>
        <h1>Giao hàng và đổi trả</h1>
        <p>
          Thông tin hiện có về cách đặt hàng, thanh toán và theo dõi đơn tại
          MODENA.
        </p>
      </header>

      <section className="store-info-section">
        <div className="store-info-section-heading">
          <span>01</span>
          <div>
            <h2>Giao hàng</h2>
            <p>Đơn hàng được xác nhận trước khi giao.</p>
          </div>
        </div>

        <ol className="store-info-steps">
          <li>
            <strong>Đặt hàng</strong>
            <span>Điền thông tin người nhận và địa chỉ giao hàng.</span>
          </li>
          <li>
            <strong>Chờ xác nhận</strong>
            <span>MODENA sẽ liên hệ để xác nhận thông tin đơn hàng.</span>
          </li>
          <li>
            <strong>Nhận hàng</strong>
            <span>Kiểm tra sản phẩm và thanh toán khi nhận hàng (COD).</span>
          </li>
        </ol>

        <div className="store-info-facts">
          <p>
            <span>Phí vận chuyển</span>
            <strong>Miễn phí</strong>
          </p>
          <p>
            <span>Thanh toán</span>
            <strong>COD</strong>
          </p>
        </div>
      </section>

      <section className="store-info-section">
        <div className="store-info-section-heading">
          <span>02</span>
          <div>
            <h2>Theo dõi đơn hàng</h2>
            <p>Tra cứu trạng thái sau khi đặt hàng thành công.</p>
          </div>
        </div>

        <div className="store-info-action-links">
          <Link to="/track-order">Tra cứu đơn hàng khách vãng lai</Link>
          <Link to="/account/orders">Xem đơn hàng trong tài khoản</Link>
        </div>
      </section>

      <section className="store-info-section">
        <div className="store-info-section-heading">
          <span>03</span>
          <div>
            <h2>Đổi trả</h2>
            <p>Trao đổi với shop trước khi gửi sản phẩm lại.</p>
          </div>
        </div>

        <div className="store-info-note">
          <p>
            Website hiện chưa công bố thời hạn và điều kiện đổi trả cụ thể.
            Nếu sản phẩm có vấn đề, vui lòng liên hệ MODENA trước khi gửi hàng
            lại và cung cấp mã đơn để shop kiểm tra, hướng dẫn bước tiếp theo.
          </p>
        </div>
      </section>

      <section className="store-info-section">
        <div className="store-info-section-heading">
          <span>04</span>
          <div>
            <h2>Liên hệ MODENA</h2>
            <p>Các kênh hỗ trợ khi bạn cần tư vấn hoặc hỏi về đơn hàng.</p>
          </div>
        </div>

        <div className="store-info-contact-grid">
          <article className="store-info-contact-card">
            <span>Điện thoại</span>
            <strong>09xx xxx xxx</strong>
          </article>
          <article className="store-info-contact-card">
            <span>Email</span>
            <a href="mailto:hotro@modena.example">hotro@modena.example</a>
          </article>
          <article className="store-info-contact-card">
            <span>Facebook / Zalo</span>
            <strong>Thêm liên kết của shop</strong>
          </article>
        </div>

        <p className="store-info-contact-note">
          Thông tin trên chỉ là ví dụ minh họa. Hãy thay bằng số điện thoại,
          email và trang mạng xã hội thật của shop trước khi đưa website vào sử
          dụng.
        </p>
      </section>

      <nav className="store-info-links" aria-label="Thông tin mua sắm">
        <Link to="/">← Quay lại sản phẩm</Link>
        <Link to="/size-guide">Hướng dẫn chọn size →</Link>
      </nav>
    </main>
  );
}
