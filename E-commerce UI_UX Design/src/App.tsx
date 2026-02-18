import { useState, useEffect } from "react";
import { RouterProvider } from "react-router";
import { createRouter } from "./routes";

interface CartItem {
  productId: string;
  quantity: number;
}

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const handleAddToCart = (productId: string) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.productId === productId,
      );
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (
    productId: string,
    change: number,
  ) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: Math.max(1, item.quantity + change),
            }
          : item,
      ),
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) =>
      prev.filter((item) => item.productId !== productId),
    );
  };

  const router = createRouter(
    cartItems,
    handleAddToCart,
    handleUpdateQuantity,
    handleRemoveItem,
  );

  return <RouterProvider router={router} />;
}