import React, { useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CartContext } from "../contexts/CartContext";
import { OrderContext } from "../contexts/OrderContext";
import { AuthContext } from "../contexts/AuthContext";
import api from "../api";
import { Ionicons } from "@expo/vector-icons";

const CartScreen = ({ navigation }) => {
  const { cartItems, fetchCart, loading, setCartItems } =
    useContext(CartContext);
  const { fetchOrders } = useContext(OrderContext);
  const {
    isAuthenticated,
    token,
    loading: authLoading,
  } = useContext(AuthContext);

  useEffect(() => {
    if (!authLoading && isAuthenticated && token) {
      fetchCart();
    }
  }, [authLoading, isAuthenticated, token]);

  const updateQuantity = async (productId, newQuantity) => {
    if (!isAuthenticated || !token) {
      Alert.alert("Ошибка", "Необходимо авторизоваться.");
      return;
    }

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
    if (!isAuthenticated || !token) {
      Alert.alert("Ошибка", "Необходимо авторизоваться.");
      return;
    }

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
    if (!isAuthenticated || !token) {
      Alert.alert("Ошибка", "Необходимо авторизоваться.");
      return;
    }

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

  const renderItem = ({ item }) => {
    const price = parseFloat(item.price) || 0;
    const quantity = item.quantity || 1;

    return (
      <View style={styles.cartCard}>
        <Text style={styles.itemName}>
          {item.productname || "Название отсутствует"}
        </Text>
        <Text style={styles.itemPrice}>Цена: {price.toFixed(2)} руб.</Text>
        <Text style={styles.itemTotal}>
          Итого: {(price * quantity).toFixed(2)} руб.
        </Text>
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Количество:</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.product_id, quantity - 1)}
          >
            <Ionicons name="remove" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.product_id, quantity + 1)}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => removeItem(item.product_id)}
        >
          <Text style={styles.deleteButtonText}>Удалить</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const totalPrice = cartItems
    .reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = item.quantity || 1;
      return sum + price * quantity;
    }, 0)
    .toFixed(2);

  if (loading || authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Загрузка корзины...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <Text style={styles.emptyText}>Ваша корзина пуста</Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.product_id.toString()}
            style={styles.cartList}
          />
          <View style={styles.footer}>
            <Text style={styles.totalText}>Итого: {totalPrice} руб.</Text>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutButtonText}>Оформить заказ</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cartList: {
    marginBottom: 20,
  },
  cartCard: {
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  quantityLabel: {
    fontSize: 14,
    color: "#333",
    marginRight: 10,
  },
  quantityButton: {
    backgroundColor: "#007bff",
    padding: 5,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  quantity: {
    fontSize: 16,
    color: "#333",
    width: 30,
    textAlign: "center",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  checkoutButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 18,
    color: "#666",
    marginTop: 50,
  },
});

export default CartScreen;
