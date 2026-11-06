import LayoutDefault from "../layout/LayoutDefault/index.jsx";
import ProductsPage from "../pages/Products/ProductsPage.jsx";
import ProductDetailPage from "../pages/Products/ProductDetailPage.jsx";
import CartPage from "../pages/Cart/CartPage.jsx";
import CheckoutPage from "../pages/Checkout/CheckoutPage.jsx";
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
    ],
  },
];

export default routes;
