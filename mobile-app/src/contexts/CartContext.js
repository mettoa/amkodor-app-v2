import React, { createContext, useState, useContext, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import api from "../api";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated, token } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !token) {
      console.log("Недостаточно данных для загрузки корзины");
      setCartItems([]);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get("/carts");
      console.log("Корзина:", response.data);
      const newItems = response.data.data || response.data;
      setCartItems((prevItems) => {
        if (JSON.stringify(prevItems) !== JSON.stringify(newItems)) {
          return newItems;
        }
        return prevItems;
      });
    } catch (error) {
      console.error(
        "Ошибка загрузки корзины:",
        error.response?.data || error.message
      );
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  const addToCart = useCallback(
    async (productId, quantity = 1) => {
      if (!isAuthenticated || !token) {
        console.log("Не авторизован для добавления в корзину");
        return false;
      }

      try {
        const response = await api.post(`/carts/${productId}`, { quantity });
        console.log("Добавлено в корзину:", response.data);
        await fetchCart();
        return true;
      } catch (error) {
        console.error(
          "Ошибка добавления:",
          error.response?.data || error.message
        );
        return false;
      }
    },
    [isAuthenticated, token, fetchCart]
  );

  return (
    <CartContext.Provider
      value={{ cartItems, setCartItems, fetchCart, addToCart, loading }}
    >
      {children}
    </CartContext.Provider>
  );
};
