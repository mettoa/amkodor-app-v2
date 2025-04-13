import React, { useState, useEffect, useContext } from "react";
import { View, Text, FlatList, StyleSheet, Alert } from "react-native";
import api from "../api";
import { AuthContext } from "../contexts/AuthContext";
import { CartContext } from "../contexts/CartContext";

import ProductCard from "../components/product/ProductCard";
import SearchBar from "../components/filters/SearchBar";
import FilterModal from "../components/filters/FilterModal";

import useProductFilters from "../hooks/useProductFilters";

const CatalogScreen = ({ navigation }) => {
  const {
    isAuthenticated,
    token,
    loading: authLoading,
  } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const {
    filters,
    filteredProducts,
    toggleCategory,
    handleSortChange,
    handleSearchChange,
    resetFilters,
  } = useProductFilters(products);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !token) {
        console.log("Пользователь не авторизован:", { isAuthenticated, token });
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/products");
        console.log("Продукты:", response.data);
        setProducts(response.data);

        const uniqueCategories = [
          ...new Map(
            response.data.map((item) => [
              item.category_id,
              { category_id: item.category_id, name: item.category_name },
            ])
          ).values(),
        ];
        console.log("Категории:", uniqueCategories);
        setCategories(uniqueCategories);
      } catch (error) {
        console.error(
          "Ошибка загрузки продуктов:",
          error.response?.data || error.message
        );
        Alert.alert("Ошибка", "Не удалось загрузить данные.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }
  }, [isAuthenticated, token, authLoading]);

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

  const handleResetFilters = () => {
    resetFilters();
    setSortModalVisible(false);
  };

  if (loading || authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar
        searchQuery={filters.searchQuery}
        onSearchChange={handleSearchChange}
        onFilterPress={() => setSortModalVisible(true)}
      />

      <FilterModal
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        onReset={handleResetFilters}
        categories={categories}
        selectedCategories={filters.selectedCategories}
        onToggleCategory={toggleCategory}
        sortOption={filters.sortOption}
        onSortChange={handleSortChange}
      />

      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onPress={() =>
              navigation.navigate("ProductDetail", {
                productId: item.product_id,
              })
            }
            onAddToCart={() => handleAddToCart(item.product_id)}
          />
        )}
        keyExtractor={(item) => item.product_id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Нет продуктов для отображения</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 10 },
  emptyText: { textAlign: "center", fontSize: 16, color: "#888" },
});

export default CatalogScreen;
