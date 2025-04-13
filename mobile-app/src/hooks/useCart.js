import { useContext } from "react";
import { Alert } from "react-native";
import { CartContext } from "../contexts/CartContext";
import { OrderContext } from "../contexts/OrderContext";
import { AuthContext } from "../contexts/AuthContext";
import api from "../api";

const useCart = () => {
  const { cartItems, setCartItems } = useContext(CartContext);
  const { fetchOrders } = useContext(OrderContext);
  const { isAuthenticated, token } = useContext(AuthContext);

  const checkAuth = () => {
    if (!isAuthenticated || !token) {
      Alert.alert("Ошибка", "Необходимо авторизоваться.");
      return false;
    }
    return true;
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (!checkAuth()) return;

    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }

    try {
      await api.put(`/carts/${productId}`, { quantity: newQuantity });
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.product_id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Ошибка обновления:",
        error.response?.data || error.message
      );
      Alert.alert("Ошибка", "Не удалось обновить количество");
    }
  };

  const removeItem = async (productId) => {
    if (!checkAuth()) return;

    try {
      await api.delete(`/carts/${productId}`);
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.product_id !== productId)
      );
      Alert.alert("Успех", "Товар удалён из корзины");
    } catch (error) {
      console.error("Ошибка удаления:", error.response?.data || error.message);
      Alert.alert("Ошибка", "Не удалось удалить товар");
    }
  };

  const handleCheckout = async () => {
    if (!checkAuth()) return;

    try {
      await api.post("/orders", {});
      setCartItems([]);
      await fetchOrders();
      Alert.alert("Успех", "Заказ оформлен!");
    } catch (error) {
      console.error(
        "Ошибка оформления:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Ошибка",
        error.response?.data?.error || "Не удалось оформить заказ"
      );
    }
  };

  const calculateTotalPrice = () => {
    return cartItems
      .reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = item.quantity || 1;
        return sum + price * quantity;
      }, 0)
      .toFixed(2);
  };

  return {
    updateQuantity,
    removeItem,
    handleCheckout,
    calculateTotalPrice,
  };
};

export default useCart;
