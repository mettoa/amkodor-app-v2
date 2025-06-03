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
  Dimensions,
} from "react-native";
import api, { IMAGE_BASE_URL } from "../api";
import { AuthContext } from "../contexts/AuthContext";
import { CartContext } from "../contexts/CartContext";

const { width: screenWidth } = Dimensions.get("window");

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Товар не найден</Text>
      </View>
    );
  }

  const imageUrl = product.image_url
    ? `${IMAGE_BASE_URL}${product.image_url}`
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Изображение товара */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={styles.noImageText}>Нет изображения</Text>
            </View>
          )}
        </View>

        {/* Основная информация */}
        <View style={styles.contentContainer}>
          <View style={styles.headerSection}>
            <Text style={styles.productName}>{product.productname}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{product.price}</Text>
              <Text style={styles.currency}>₽</Text>
            </View>
          </View>

          {/* Категория */}
          {product.category_name && (
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryLabel}>Категория:</Text>
              <Text style={styles.categoryName}>{product.category_name}</Text>
            </View>
          )}

          {/* Описание */}
          {product.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionTitle}>Описание</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          {/* Дата добавления */}
          <View style={styles.metaInfo}>
            <Text style={styles.dateText}>
              Добавлен: {formatDate(product.created_at)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Кнопка добавления в корзину */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => handleAddToCart(product.product_id)}
          activeOpacity={0.8}
        >
          <Text style={styles.addToCartButtonText}>Добавить в корзину</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: "100%",
    height: screenWidth * 0.8,
    backgroundColor: "#f8f9fa",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  noImageContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f3f4",
  },
  noImageText: {
    fontSize: 16,
    color: "#9aa0a6",
    fontWeight: "500",
  },
  contentContainer: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#202124",
    lineHeight: 32,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1976d2",
  },
  currency: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1976d2",
    marginLeft: 4,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  categoryLabel: {
    fontSize: 14,
    color: "#5f6368",
    fontWeight: "500",
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    color: "#1976d2",
    fontWeight: "600",
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#202124",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#5f6368",
    lineHeight: 24,
    textAlign: "justify",
  },
  metaInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e8eaed",
  },
  dateText: {
    fontSize: 14,
    color: "#9aa0a6",
    fontStyle: "italic",
  },
  loadingText: {
    fontSize: 18,
    color: "#5f6368",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 18,
    color: "#d93025",
    fontWeight: "500",
    textAlign: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#e8eaed",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  addToCartButton: {
    backgroundColor: "#1976d2",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#1976d2",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addToCartButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});

export default ProductDetailScreen;
