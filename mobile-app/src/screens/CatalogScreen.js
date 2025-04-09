import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Button,
  StyleSheet,
} from "react-native";
import axios from "axios";

const CatalogScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Ошибка загрузки товаров:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const renderProduct = ({ item }) => {
    const categoryName = item.category_name || "Неизвестная категория";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("ProductDetail", { productId: item.product_id })
        }
      >
        {/* <Image
          source={{ uri: `http://localhost:3000${item.image_url}` }}
          style={styles.image}
          onError={(e) =>
            console.log("Ошибка загрузки изображения:", e.nativeEvent.error)
          }
        /> */}
        <Text style={styles.name}>{item.productname}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.price}>{item.price} руб.</Text>
        <Button
          title="В корзину"
          onPress={() => console.log("Добавлено в корзину:", item.product_id)}
        />
        <Text style={styles.category}>Категория: {categoryName}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.product_id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 10 },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    elevation: 3,
  },
  image: { width: "100%", height: 150, resizeMode: "cover", marginBottom: 10 },
  name: { fontSize: 18, fontWeight: "bold" },
  description: { fontSize: 14, color: "#666", marginVertical: 5 },
  price: { fontSize: 16, color: "#000", marginBottom: 10 },
  category: { fontSize: 12, color: "#888", marginTop: 5 },
});

export default CatalogScreen;
