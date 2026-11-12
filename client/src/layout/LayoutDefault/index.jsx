import { Layout } from 'antd';
import { Outlet } from "react-router";
import { Link } from "react-router";
import { useCart } from "../../context/CartContext.jsx";
import "./style.css";
import { useAuth } from "../../context/AuthContext.jsx";
const { Header, Content, Footer } = Layout;

function LayoutDefault() {
  const { items } = useCart();
  const { user, logout } = useAuth();
  const cartCount = items.reduce((total, item) => total + item.quantity, 0);
  return (
    <>
      <Layout>
        <Header className="site-header">
          <Link className="brand" to="/">MODENA</Link>
          <nav className="site-nav">
            <Link className="nav-link" to="/">Sản phẩm</Link>
            <Link className="nav-link" to="/cart">
              Giỏ hàng ({cartCount})
            </Link>
            <Link className="nav-link" to="/track-order">
              Tra cứu đơn
            </Link>
            {user ? (
              <>
                <span className="nav-account-name">{user.fullName}</span>
                <Link className="nav-link" to="/account/orders">
                  Đơn hàng
                </Link>
                <Link className="nav-link" to="/account/profile">
                  Hồ sơ
                </Link>
                <Link className="nav-link" to="/account/wishlist">
                  Yêu thích
                </Link>
                <button className="nav-link nav-logout" type="button" onClick={logout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link className="nav-link" to="/login">Tài khoản</Link>
            )}
          </nav>
        </Header>
        <Content>
          <Outlet />
        </Content>
        <Footer className="site-footer">
          <span>MODENA · Thông tin mua sắm</span>
          <nav aria-label="Hỗ trợ khách hàng">
            <Link to="/size-guide">Hướng dẫn chọn size</Link>
            <Link to="/shipping-returns">Giao hàng và đổi trả</Link>
            <Link to="/track-order">Tra cứu đơn hàng</Link>
          </nav>
        </Footer>
      </Layout>

    </>

  )
}
export default LayoutDefault;
