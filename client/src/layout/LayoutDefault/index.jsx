import { Layout } from 'antd';
import { Outlet } from "react-router";
import { Link } from "react-router";
import { useCart } from "../../context/CartContext.jsx";
import "./style.css";
const { Header, Content } = Layout;


function LayoutDefault() {
  const { items } = useCart();
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
          </nav>
        </Header>
        <Content>
          <Outlet />
        </Content>
      </Layout>

    </>

  )
}
export default LayoutDefault;
