import React, { createContext, useState, useContext, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import api from "../api";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const { isAuthenticated, token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated || !token) {
      console.log("Недостаточно данных для загрузки заказов:", {
        isAuthenticated,
        token,
      });
      setOrders([]);
      return;
    }

    try {
      setLoading(true);
      console.log("Отправка запроса GET /orders с токеном:", token);
      const response = await api.get("/orders/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Ответ GET /orders:", response.data);
      const newOrders = response.data.data || response.data;
      setOrders((prevOrders) => {
        if (JSON.stringify(prevOrders) !== JSON.stringify(newOrders)) {
          return newOrders;
        }
        return prevOrders;
      });
    } catch (error) {
      console.error(
        "Ошибка загрузки заказов:",
        error.response?.data || error.message
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  return (
    <OrderContext.Provider value={{ orders, setOrders, fetchOrders, loading }}>
      {children}
    </OrderContext.Provider>
  );
};
