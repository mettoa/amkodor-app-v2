import React from "react";
import { Text, TouchableOpacity, Button, StyleSheet } from "react-native";

const ProductCard = ({ item, onPress, onAddToCart }) => {
  const categoryName = item.category_name || "Неизвестная категория";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.name}>{item.productname}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.price}>{item.price} руб.</Text>
      <Button title="В корзину" onPress={onAddToCart} />
      <Text style={styles.category}>Категория: {categoryName}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
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
  name: { fontSize: 18, fontWeight: "bold", color: "#333" },
  description: { fontSize: 14, color: "#666", marginVertical: 5 },
  price: { fontSize: 16, color: "#000", marginBottom: 10 },
  category: { fontSize: 12, color: "#888", marginTop: 5 },
});

export default ProductCard;
