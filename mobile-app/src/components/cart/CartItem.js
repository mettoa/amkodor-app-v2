import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
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
          onPress={() => onUpdateQuantity(item.product_id, quantity - 1)}
        >
          <Ionicons name="remove" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.quantity}>{quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => onUpdateQuantity(item.product_id, quantity + 1)}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onRemove(item.product_id)}
      >
        <Text style={styles.deleteButtonText}>Удалить</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default CartItem;
