import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import {
  getAccountCart,
  mergeGuestCart,
  saveAccountCart,
} from "../services/cartService.js";

const CartContext = createContext(undefined);
const STORAGE_KEY = "modena-cart";
const CART_OWNER_KEY = "modena-cart-owner";
const MAX_LINE_QUANTITY = 99;

function readCart() {
  try {
    const savedCart = localStorage.getItem(STORAGE_KEY);
    const cart = savedCart ? JSON.parse(savedCart) : [];
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

function matchesCartLine(item, productId, size = "", color = "") {
  return (
    item.productId === productId &&
    (item.size || "") === size &&
    (item.color || "") === color
  );
}

function getProductQuantity(items, productId) {
  return items.reduce(
    (total, item) =>
      item.productId === productId ? total + Number(item.quantity || 0) : total,
    0
  );
}

function toServerCart(items) {
  return items.map(({ productId, quantity, priceAtAdd, size, color }) => ({
    productId,
    quantity,
    priceAtAdd,
    size: size || "",
    color: color || "",
  }));
}

export function CartProvider({ children }) {
  const { token, user, isAuthLoading } = useAuth();
  const [items, setItems] = useState(readCart);
  const [accountCartId, setAccountCartId] = useState("");
  const [cartSyncError, setCartSyncError] = useState("");
  const [cartLoadAttempt, setCartLoadAttempt] = useState(0);
  const [cartSaveAttempt, setCartSaveAttempt] = useState(0);
  const cartLoadRequestsRef = useRef(new Map());
  const cartSaveQueueRef = useRef(Promise.resolve());
  const previousTokenRef = useRef(token);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    const previousToken = previousTokenRef.current;
    previousTokenRef.current = token;

    if (previousToken && !token) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CART_OWNER_KEY);
      setItems([]);
      setAccountCartId("");
      setCartSyncError("");
    }
  }, [token]);

  useEffect(() => {
    if (isAuthLoading || !token || !user?.id) {
      if (!token) setAccountCartId("");
      return undefined;
    }

    let active = true;
    const accountId = String(user.id);
    const cartOwnerId = localStorage.getItem(CART_OWNER_KEY) || "";
    const requestKey = `${token}:${accountId}:${cartOwnerId}`;
    let request = cartLoadRequestsRef.current.get(requestKey);

    if (!request) {
      request = cartOwnerId
        ? getAccountCart(token)
        : mergeGuestCart(token, toServerCart(readCart()));
      cartLoadRequestsRef.current.set(requestKey, request);
    }

    setAccountCartId("");
    setCartSyncError("");

    request
      .then((accountItems) => {
        if (!active) return;

        setItems(accountItems);
        localStorage.setItem(CART_OWNER_KEY, accountId);
        setAccountCartId(accountId);
      })
      .catch((requestError) => {
        cartLoadRequestsRef.current.delete(requestKey);
        if (active) {
          setCartSyncError(
            requestError.message || "Không thể tải giỏ hàng đã lưu."
          );
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthLoading, token, user?.id, cartLoadAttempt]);

  useEffect(() => {
    if (
      !token ||
      isAuthLoading ||
      !user?.id ||
      accountCartId !== String(user.id)
    ) {
      return;
    }

    const itemsToSave = toServerCart(items);
    cartSaveQueueRef.current = cartSaveQueueRef.current
      .catch(() => {})
      .then(() => saveAccountCart(token, itemsToSave))
      .then(() => setCartSyncError(""))
      .catch((requestError) => {
        setCartSyncError(
          requestError.message || "Không thể đồng bộ giỏ hàng."
        );
      });
  }, [items, token, isAuthLoading, user?.id, accountCartId, cartSaveAttempt]);

  const isCartSyncing = Boolean(
    token &&
      (isAuthLoading || !user?.id || accountCartId !== String(user.id))
  );

  function retryCartSync() {
    setCartSyncError("");

    if (token && user?.id && accountCartId === String(user.id)) {
      setCartSaveAttempt((attempt) => attempt + 1);
      return;
    }

    setCartLoadAttempt((attempt) => attempt + 1);
  }

  function removeItem(productId, size = "", color = "") {
    setItems((currentItems) =>
      currentItems.filter(
        (item) => !matchesCartLine(item, productId, size, color)
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  function refreshProduct(product) {
    if (!product?._id) return;

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === product._id
          ? {
              ...item,
              name: product.name,
              priceAtAdd: item.priceAtAdd ?? item.price,
              price: product.price,
              image: product.images?.[0] || "",
              stock: Number(product.stock) || 0,
            }
          : item
      )
    );
  }

  function updateQuantity(productId, size, color, newQuantity) {
    setItems((currentItems) => {
      const item = currentItems.find((currentItem) =>
        matchesCartLine(currentItem, productId, size, color)
      );

      if (!item) return currentItems;

      const stock = Number(item.stock) || 0;
      const otherVariantQuantity =
        getProductQuantity(currentItems, productId) - Number(item.quantity || 0);
      const maxQuantity = Math.min(
        MAX_LINE_QUANTITY,
        Math.max(1, stock - otherVariantQuantity)
      );
      const requestedQuantity = Number(newQuantity) || 1;
      const quantity = Math.min(Math.max(requestedQuantity, 1), maxQuantity);

      return currentItems.map((currentItem) =>
        matchesCartLine(currentItem, productId, size, color)
          ? { ...currentItem, quantity }
          : currentItem
      );
    });
  }

  function updateVariant(productId, oldSize, oldColor, newSize, newColor) {
    if (oldSize === newSize && oldColor === newColor) return;

    setItems((currentItems) => {
      const sourceItem = currentItems.find((item) =>
        matchesCartLine(item, productId, oldSize, oldColor)
      );

      if (!sourceItem) return currentItems;

      const targetItem = currentItems.find(
        (item) =>
          !matchesCartLine(item, productId, oldSize, oldColor) &&
          matchesCartLine(item, productId, newSize, newColor)
      );

      if (!targetItem) {
        return currentItems.map((item) =>
          matchesCartLine(item, productId, oldSize, oldColor)
            ? { ...item, size: newSize, color: newColor }
            : item
        );
      }

      const combinedQuantity =
        Number(targetItem.quantity || 0) + Number(sourceItem.quantity || 0);

      if (combinedQuantity > MAX_LINE_QUANTITY) return currentItems;

      let mergedTarget = false;

      return currentItems.flatMap((item) => {
        if (matchesCartLine(item, productId, oldSize, oldColor)) return [];

        if (item === targetItem && !mergedTarget) {
          mergedTarget = true;
          return [{ ...item, quantity: combinedQuantity }];
        }

        return [item];
      });
    });
  }

  function addItem(product) {
    if (!product?._id) return;

    const stock = Number(product.stock) || 0;
    if (stock <= 0) return;

    const size = product.selectedSize || "";
    const color = product.selectedColor || "";

    setItems((currentItems) => {
      const productQuantity = getProductQuantity(currentItems, product._id);
      if (productQuantity >= stock) return currentItems;

      const existingItem = currentItems.find((item) =>
        matchesCartLine(item, product._id, size, color)
      );

      if (existingItem) {
        if (existingItem.quantity >= MAX_LINE_QUANTITY) return currentItems;

        return currentItems.map((item) =>
          matchesCartLine(item, product._id, size, color)
            ? {
                ...item,
                quantity: item.quantity + 1,
                price: product.price,
                priceAtAdd: product.price,
                stock,
              }
            : item.productId === product._id
              ? { ...item, stock }
              : item
        );
      }

      return [
        ...currentItems.map((item) =>
          item.productId === product._id ? { ...item, stock } : item
        ),
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          priceAtAdd: product.price,
          image: product.images?.[0] || "",
          quantity: 1,
          stock,
          size,
          color,
        },
      ];
    });
  }

  function addItems(lines) {
    setItems((currentItems) => {
      let nextItems = [...currentItems];

      for (const line of lines) {
        const product = line.product;
        const productId = product?._id;
        const stock = Number(product?.stock) || 0;
        const size = line.size || "";
        const color = line.color || "";
        const quantity = Number(line.quantity) || 0;

        if (!productId || product.isActive === false || stock <= 0 || quantity <= 0) {
          continue;
        }

        const sizes = product.sizes || [];
        const colors = product.colors || [];
        const sizeIsValid = sizes.length ? sizes.includes(size) : !size;
        const colorIsValid = colors.length ? colors.includes(color) : !color;

        if (!sizeIsValid || !colorIsValid) continue;

        const existingItem = nextItems.find((item) =>
          matchesCartLine(item, productId, size, color)
        );
        const productQuantity = getProductQuantity(nextItems, productId);
        const remainingStock = Math.max(0, stock - productQuantity);
        const remainingLineCapacity = existingItem
          ? MAX_LINE_QUANTITY - Number(existingItem.quantity || 0)
          : MAX_LINE_QUANTITY;
        const quantityToAdd = Math.min(
          quantity,
          remainingStock,
          remainingLineCapacity
        );

        if (quantityToAdd < 1) continue;

        const productInfo = {
          name: product.name,
          price: product.price,
          priceAtAdd: product.price,
          image: product.images?.[0] || "",
          stock,
        };

        nextItems = nextItems.map((item) =>
          item.productId === productId ? { ...item, ...productInfo } : item
        );

        if (existingItem) {
          nextItems = nextItems.map((item) =>
            matchesCartLine(item, productId, size, color)
              ? { ...item, quantity: Number(item.quantity) + quantityToAdd }
              : item
          );
        } else {
          nextItems.push({
            productId,
            ...productInfo,
            quantity: quantityToAdd,
            size,
            color,
          });
        }
      }

      return nextItems;
    });
  }

  return (
    <CartContext.Provider
      value={{
        items,
        isCartSyncing,
        cartSyncError,
        retryCartSync,
        addItem,
        addItems,
        removeItem,
        updateQuantity,
        updateVariant,
        refreshProduct,
        clearCart,
      }}
    >
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
