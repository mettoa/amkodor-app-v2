import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
} from "react-native";
import api, { IMAGE_BASE_URL } from "../api";
import { AuthContext } from "../contexts/AuthContext";
import { CartContext } from "../contexts/CartContext";

const ProductDetailScreen = ({ route }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);
  const { isAuthenticated, token } = useContext(AuthContext);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${productId}`);
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

  const handleAddToCart = async (productId) => {
    console.log("Добавление в корзину:", {
      isAuthenticated,
      token,
      productId,
    });

    if (!isAuthenticated || !token) {
      Alert.alert("Ошибка", "Необходимо авторизоваться.");
      return;
    }

    const success = await addToCart(productId);
    if (success) {
      Alert.alert("Успех", "Товар добавлен в корзину");
    } else {
      Alert.alert("Ошибка", "Не удалось добавить товар в корзину");
    }
  };

  if (loading) {
    return <Text style={styles.message}>Загрузка...</Text>;
  }

  if (error) {
    return <Text style={styles.message}>{error}</Text>;
  }

  if (!product) {
    return <Text style={styles.message}>Товар не найден</Text>;
  }

  const imageUrl = product.image_url
    ? `${IMAGE_BASE_URL}${product.image_url}`
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        <Text style={styles.name}>{product.productname}</Text>
        <Text style={styles.description}>{product.description}</Text>
        <Text style={styles.price}>{product.price} руб.</Text>
        <Text style={styles.detail}>ID: {product.product_id}</Text>
        <Text style={styles.detail}>Категория: {product.category_name}</Text>
        <Text style={styles.detail}>Категория ID: {product.category_id}</Text>
        <Text style={styles.detail}>
          Создан: {new Date(product.created_at).toLocaleString()}
        </Text>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => handleAddToCart(product.product_id)}
        >
          <Text style={styles.addToCartButtonText}>В корзину</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    color: "#000",
    fontWeight: "bold",
    marginBottom: 10,
  },
  detail: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
  },
  message: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  addToCartButton: {
    backgroundColor: "#097ffe",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  addToCartButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProductDetailScreen;
