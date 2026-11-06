import { createContext, useContext, useEffect, useState } from "react"
const CartContext = createContext(undefined)
const STORAGE_KEY = "modena-cart"

function readCart() {
  try {
    const savedCart = localStorage.getItem(STORAGE_KEY);
    const cart = savedCart ? JSON.parse(savedCart) : [];
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);
  function removeItem(productId) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.productId !== productId)
    );
  }
  function clearCart() {
    setItems([]);
  }
  function updateQuantity(productId, newQuantity) {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.productId !== productId) return item;

        const stock = Number(item.stock) || 0;
        if (stock < 1) return item;

        const requestedQuantity = Number(newQuantity) || 1;
        const quantity = Math.min(
          Math.max(requestedQuantity, 1),
          stock
        );

        return { ...item, quantity };
      })
    );
  }
  function addItem(product) {
    if (!product?._id) return;

    const stock = Number(product.stock) || 0;
    if (stock <= 0) return;

    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.productId === product._id
      );

      if (existingItem) {
        if (existingItem.quantity >= stock) return currentItems;

        return currentItems.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1, stock }
            : item
        );
      }

      return [
        ...currentItems,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || "",
          quantity: 1,
          stock,
        },
      ];
    });
  }

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity,
      clearCart 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
