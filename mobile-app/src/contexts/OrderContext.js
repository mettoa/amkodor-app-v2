import React, { createContext, useState, useContext, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import api from "../api";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const { isAuthenticated, token, user } = useContext(AuthContext);
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
      console.log("Пользователь:", user);

      const response = await api.get("/orders/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
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
      console.error("Статус ошибки:", error.response?.status);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, user]);

  const cancelOrder = useCallback(
    async (orderId) => {
      if (!token) {
        throw new Error("Токен авторизации отсутствует");
      }

      try {
        console.log("Отмена заказа через контекст:", orderId);
        console.log("Токен:", token);
        console.log("Пользователь:", user);

        const response = await api.put(
          `/orders/${orderId}/cancel`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Успешная отмена заказа:", response.data);

        // Обновляем состояние заказов
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.order_id === orderId
              ? { ...order, status: "Cancelled" }
              : order
          )
        );

        return response.data;
      } catch (error) {
        console.error(
          "Ошибка отмены заказа в контексте:",
          error.response?.data || error.message
        );
        throw error;
      }
    },
    [token, user]
  );

  return (
    <OrderContext.Provider
      value={{
        orders,
        setOrders,
        fetchOrders,
        cancelOrder,
        loading,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
