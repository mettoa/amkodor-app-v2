import React from "react";
import { Text, StyleSheet } from "react-native";

const EmptyCart = () => {
  return <Text style={styles.emptyText}>Ваша корзина пуста</Text>;
};

const styles = StyleSheet.create({
  emptyText: {
    textAlign: "center",
    fontSize: 18,
    color: "#666",
    marginTop: 50,
  },
});

export default EmptyCart;
