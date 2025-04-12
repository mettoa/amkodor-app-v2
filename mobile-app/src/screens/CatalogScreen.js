import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
} from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Button,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import api from "../api";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../contexts/AuthContext";
import { CartContext } from "../contexts/CartContext";

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

  const [filters, setFilters] = useState({
    searchQuery: "",
    selectedCategories: new Set(),
    sortOption: null,
  });

  const { searchQuery, selectedCategories, sortOption } = filters;

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

  const filterAndSortProducts = useCallback(() => {
    let result = [...products];

    if (searchQuery) {
      result = result.filter((item) =>
        item.productname.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategories.size > 0) {
      result = result.filter((item) =>
        selectedCategories.has(item.category_id)
      );
    }

    if (sortOption === "priceAsc") {
      result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortOption === "priceDesc") {
      result.sort((a, b) => parseFloat(b.price) - parseFloat(b.price));
    } else if (sortOption === "name") {
      result.sort((a, b) => a.productname.localeCompare(b.productname));
    }

    return result;
  }, [products, searchQuery, selectedCategories, sortOption]);

  const filteredAndSortedProducts = useMemo(
    () => filterAndSortProducts(),
    [filterAndSortProducts]
  );

  const toggleCategory = useCallback((categoryId) => {
    setFilters((prevFilters) => {
      const updatedCategories = new Set(prevFilters.selectedCategories);
      if (updatedCategories.has(categoryId)) {
        updatedCategories.delete(categoryId);
      } else {
        updatedCategories.add(categoryId);
      }
      return { ...prevFilters, selectedCategories: updatedCategories };
    });
  }, []);

  const handleSortChange = useCallback((option) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      sortOption: option,
    }));
  }, []);

  const handleAddToCart = useCallback(
    async (productId) => {
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
    },
    [isAuthenticated, token, addToCart]
  );

  const renderProduct = ({ item }) => {
    const categoryName = item.category_name || "Неизвестная категория";
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("ProductDetail", { productId: item.product_id })
        }
      >
        <Text style={styles.name}>{item.productname}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.price}>{item.price} руб.</Text>
        <Button
          title="В корзину"
          onPress={() => handleAddToCart(item.product_id)}
        />
        <Text style={styles.category}>Категория: {categoryName}</Text>
      </TouchableOpacity>
    );
  };

  const renderCategoryCheckbox = ({ item }) => (
    <TouchableOpacity
      style={styles.checkboxItem}
      onPress={() => toggleCategory(item.category_id)}
    >
      <Ionicons
        name={
          selectedCategories.has(item.category_id)
            ? "checkbox"
            : "checkbox-outline"
        }
        size={24}
        color="#000"
      />
      <Text style={styles.checkboxText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderSortOption = (label, option) => (
    <TouchableOpacity
      style={styles.checkboxItem}
      onPress={() => handleSortChange(option)}
    >
      <Ionicons
        name={sortOption === option ? "checkbox" : "checkbox-outline"}
        size={24}
        color="#000"
      />
      <Text style={styles.checkboxText}>{label}</Text>
    </TouchableOpacity>
  );

  if (loading || authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по названию..."
          value={searchQuery}
          onChangeText={(text) =>
            setFilters((prevFilters) => ({
              ...prevFilters,
              searchQuery: text,
            }))
          }
        />
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortModalVisible(true)}
        >
          <Ionicons name="filter" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={sortModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Фильтры и сортировка</Text>

            <Text style={styles.sectionTitle}>Категории</Text>
            <FlatList
              data={categories}
              renderItem={renderCategoryCheckbox}
              keyExtractor={(item) => item.category_id.toString()}
              style={styles.filterList}
            />

            <Text style={styles.sectionTitle}>Сортировка</Text>
            {renderSortOption("Цена по возрастанию", "priceAsc")}
            {renderSortOption("Цена по убыванию", "priceDesc")}
            {renderSortOption("По названию (А-Я)", "name")}

            <Button
              title="Применить"
              onPress={() => setSortModalVisible(false)}
            />
            <Button
              title="Сбросить"
              onPress={() => {
                setFilters({
                  searchQuery: "",
                  selectedCategories: new Set(),
                  sortOption: null,
                });
                setSortModalVisible(false);
              }}
            />
          </View>
        </View>
      </Modal>

      <FlatList
        data={filteredAndSortedProducts}
        renderItem={renderProduct}
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
  searchContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  sortButton: {
    padding: 5,
  },
  list: { padding: 10 },
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: { fontSize: 18, marginBottom: 10, textAlign: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginVertical: 10 },
  filterList: { width: "100%", maxHeight: 200 },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },
  checkboxText: { fontSize: 16, marginLeft: 10 },
  emptyText: { textAlign: "center", fontSize: 16, color: "#888" },
});

export default CatalogScreen;
