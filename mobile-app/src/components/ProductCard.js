import React from "react";
import {
  Text,
  TouchableOpacity,
  Button,
  StyleSheet,
  Image,
  View,
} from "react-native";
import { IMAGE_BASE_URL } from "../api";

const ProductCard = ({ item, onPress, onAddToCart }) => {
  const categoryName = item.category_name || "Неизвестная категория";

  const imageUrl = item.image_url ? `${IMAGE_BASE_URL}${item.image_url}` : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>Нет изображения</Text>
        </View>
      )}
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
  image: {
    width: "100%",
    height: 300,
    marginBottom: 10,
    borderRadius: 4,
  },
  placeholderImage: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#888",
    fontSize: 14,
  },
  name: { fontSize: 18, fontWeight: "bold", color: "#333" },
  description: { fontSize: 14, color: "#666", marginVertical: 5 },
  price: { fontSize: 16, color: "#000", marginBottom: 10 },
  category: { fontSize: 12, color: "#888", marginTop: 5 },
});

export default ProductCard;
