import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import axios from "axios";

const ProductDetailScreen = ({ route }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/products/${productId}`
        );
        const productData = Array.isArray(response.data)
          ? response.data[0]
          : response.data;
        setProduct(productData);
      } catch (error) {
        console.error(
          "Ошибка загрузки товара:",
          error.response ? error.response.data : error.message
        );
        setError("Не удалось загрузить товар");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (error) {
    return <Text>{error}</Text>;
  }

  if (!product) {
    return <Text>Товар не найден</Text>;
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: product.image_url }} style={styles.image} />
      <Text style={styles.name}>{product.productname}</Text>
      <Text style={styles.description}>{product.description}</Text>
      <Text style={styles.price}>{product.price} руб.</Text>
      <Text style={styles.detail}>ID: {product.product_id}</Text>
      <Text style={styles.detail}>Категория: {product.category_name}</Text>
      <Text style={styles.detail}>Категория ID: {product.category_id}</Text>
      <Text style={styles.detail}>
        Создан: {new Date(product.created_at).toLocaleString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  image: { width: "100%", height: 250, resizeMode: "cover", marginBottom: 20 },
  name: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  description: { fontSize: 16, color: "#666", marginBottom: 10 },
  price: { fontSize: 20, color: "#000", marginBottom: 10 },
  detail: { fontSize: 14, color: "#888", marginBottom: 5 },
});

export default ProductDetailScreen;
