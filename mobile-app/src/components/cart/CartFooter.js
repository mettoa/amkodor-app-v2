import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const CartFooter = ({ totalPrice, onCheckout }) => {
  return (
    <View style={styles.footer}>
      <Text style={styles.totalText}>Итого: {totalPrice} руб.</Text>
      <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout}>
        <Text style={styles.checkoutButtonText}>Оформить заказ</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default CartFooter;
