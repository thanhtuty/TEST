import LayoutDefault from "../layout/LayoutDefault/index.jsx";
import ProductsPage from "../pages/Products/ProductsPage.jsx";
import ProductDetailPage from "../pages/Products/ProductDetailPage.jsx";
import CartPage from "../pages/Cart/CartPage.jsx";
import CheckoutPage from "../pages/Checkout/CheckoutPage.jsx";
import OrderSuccessPage from "../pages/Checkout/OrderSuccessPage.jsx";
import LoginPage from "../pages/Account/LoginPage.jsx";
import RegisterPage from "../pages/Account/RegisterPage.jsx";
import OrdersPage from "../pages/Account/OrdersPage.jsx";
import OrderDetailPage from "../pages/Account/OrderDetailPage.jsx";
import ProfilePage from "../pages/Account/ProfilePage.jsx";
import AddressesPage from "../pages/Account/AddressesPage.jsx";
import WishlistPage from "../pages/Account/WishlistPage.jsx";
import GuestOrderLookupPage from "../pages/Account/GuestOrderLookupPage.jsx";
import SizeGuidePage from "../pages/Info/SizeGuidePage.jsx";
import ShippingReturnsPage from "../pages/Info/ShippingReturnsPage.jsx";
import NotFoundPage from "../pages/Info/NotFoundPage.jsx";
const routes = [
  {
    path: "/",
    element: <LayoutDefault />,
    children: [
      {
        index: true,
        element: <ProductsPage />,
      },
      {
        path: "products/:id",
        element: <ProductDetailPage />,
      },
      {
        path: "cart",
        element: <CartPage />,
      },
      {
        path: "checkout",
        element: <CheckoutPage />,
      },
      {
        path: "order-success/:id",
        element: <OrderSuccessPage />,
      },
      {
        path: "size-guide",
        element: <SizeGuidePage />,
      },
      {
        path: "shipping-returns",
        element: <ShippingReturnsPage />,
      },
      {
        path: "track-order",
        element: <GuestOrderLookupPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "account/orders",
        element: <OrdersPage />,
      },
      {
        path: "account/orders/:id",
        element: <OrderDetailPage />,
      },
      {
        path: "account/profile",
        element: <ProfilePage />,
      },
      {
        path: "account/addresses",
        element: <AddressesPage />,
      },
      {
        path: "account/wishlist",
        element: <WishlistPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
];

export default routes;
