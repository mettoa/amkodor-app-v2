import { useState, useContext } from "react";
import { Alert } from "react-native";
import { OrderContext } from "../contexts/OrderContext";
import { AuthContext } from "../contexts/AuthContext";
import api from "../api";

const useOrders = () => {
  const { orders, setOrders } = useContext(OrderContext);
  const { token } = useContext(AuthContext);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleCancelOrder = (orderId) => {
    Alert.alert(
      "Подтвердите отмену",
      "Вы уверены, что хотите отменить этот заказ?",
      [
        {
          text: "Отмена",
          style: "cancel",
        },
        {
          text: "Подтвердить",
          onPress: async () => {
            try {
              await api.put(
                `/orders/${orderId}/status`,
                { status: "Cancelled" },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              setOrders((prevOrders) =>
                prevOrders.map((order) =>
                  order.order_id === orderId
                    ? { ...order, status: "Cancelled" }
                    : order
                )
              );
            } catch (error) {
              console.error("Ошибка при отмене заказа:", error.message);
              Alert.alert("Ошибка", "Не удалось отменить заказ.");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return {
    orders,
    expandedOrder,
    toggleOrderDetails,
    handleCancelOrder,
  };
};

export default useOrders;
