import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import api from "../api";
import { AuthContext } from "../contexts/AuthContext";
import { CartContext } from "../contexts/CartContext";

import ProductCard from "../components/ProductCard";
import SearchBar from "../components/filters/SearchBar";
import FilterModal from "../components/filters/FilterModal";

import useProductFilters from "../hooks/useProductFilters";

const NAV_ROUTES = {
  LOGIN: "Login",
  PRODUCT_DETAIL: "ProductDetail",
};

const ALERT_MESSAGES = {
  ADD_TO_CART_SUCCESS_AUTH: "Товар добавлен в корзину",
  ADD_TO_CART_SUCCESS_GUEST_TITLE: "Товар добавлен",
  ADD_TO_CART_SUCCESS_GUEST_MSG:
    "Товар добавлен в корзину. Для оформления заказа необходимо войти в аккаунт.",
  ADD_TO_CART_ERROR_TITLE: "Ошибка",
  ADD_TO_CART_ERROR_MSG: "Не удалось добавить товар в корзину",
  DATA_LOAD_ERROR_TITLE: "Ошибка",
  DATA_LOAD_ERROR_MSG: "Не удалось загрузить данные.",
};

const CatalogScreen = ({ navigation }) => {
  const { isAuthenticated, token } = useContext(AuthContext); // token не используется, можно убрать если он не нужен для других целей
  const { addToCart } = useContext(CartContext);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Более семантичное имя
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false); // Более семантичное имя

  const {
    filters,
    filteredProducts,
    toggleCategory,
    handleSortChange,
    handleSearchChange,
    resetFilters,
  } = useProductFilters(products);

  // Эффект для загрузки данных при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Устанавливаем загрузку в true перед запросом
      try {
        const response = await api.get("/products");
        console.log("Продукты:", response.data);
        setProducts(response.data);

        // Извлекаем уникальные категории из продуктов
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
        Alert.alert(
          ALERT_MESSAGES.DATA_LOAD_ERROR_TITLE,
          ALERT_MESSAGES.DATA_LOAD_ERROR_MSG
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Пустой массив зависимостей - эффект выполнится один раз

  const handleAddToCartPress = async (productId) => {
    console.log("Добавление в корзину:", {
      isAuthenticated,
      productId,
    });

    const success = await addToCart(productId);

    if (!success) {
      Alert.alert(
        ALERT_MESSAGES.ADD_TO_CART_ERROR_TITLE,
        ALERT_MESSAGES.ADD_TO_CART_ERROR_MSG
      );
      return;
    }

    if (isAuthenticated) {
      Alert.alert("Успех", ALERT_MESSAGES.ADD_TO_CART_SUCCESS_AUTH);
    } else {
      Alert.alert(
        ALERT_MESSAGES.ADD_TO_CART_SUCCESS_GUEST_TITLE,
        ALERT_MESSAGES.ADD_TO_CART_SUCCESS_GUEST_MSG,
        [
          {
            text: "Продолжить покупки",
            style: "cancel",
          },
          {
            text: "Войти",
            onPress: () => navigation.navigate(NAV_ROUTES.LOGIN),
          },
        ]
      );
    }
  };

  const handleResetFilters = () => {
    resetFilters();
    setIsFilterModalVisible(false);
  };

  const openFilterModal = () => setIsFilterModalVisible(true);
  const closeFilterModal = () => setIsFilterModalVisible(false);

  // Рендер компонента уведомления для гостя
  const renderGuestNotice = () => {
    if (isAuthenticated) return null;

    return (
      <View style={styles.guestNotice}>
        <Text style={styles.guestNoticeText}>
          Вы просматриваете каталог как гость.
          <Text
            style={styles.loginLink}
            onPress={() => navigation.navigate(NAV_ROUTES.LOGIN)}
          >
            {" "}
            Войдите{" "}
          </Text>
          для полного доступа к функциям.
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar
        searchQuery={filters.searchQuery}
        onSearchChange={handleSearchChange}
        onFilterPress={openFilterModal}
      />

      <FilterModal
        visible={isFilterModalVisible}
        onClose={closeFilterModal}
        onReset={handleResetFilters}
        categories={categories}
        selectedCategories={filters.selectedCategories}
        onToggleCategory={toggleCategory}
        sortOption={filters.sortOption}
        onSortChange={handleSortChange}
      />

      {renderGuestNotice()}

      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onPress={() =>
              navigation.navigate(NAV_ROUTES.PRODUCT_DETAIL, {
                productId: item.product_id,
              })
            }
            onAddToCart={() => handleAddToCartPress(item.product_id)} // Изменено имя обработчика
          />
        )}
        keyExtractor={(item) => item.product_id.toString()}
        contentContainerStyle={styles.listContentContainer} // Более описательное имя
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>
              Нет продуктов для отображения
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false} // Скрыть вертикальный скроллбар, если не нужен
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa", // Чуть другой оттенок серого
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6c757d",
  },
  listContentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyListText: {
    textAlign: "center",
    fontSize: 16,
    color: "#6c757d",
  },
  guestNotice: {
    backgroundColor: "#e3f2fd",
    padding: 12,
    marginHorizontal: 10,
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 5,
    borderLeftColor: "#2196f3",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  guestNoticeText: {
    fontSize: 14,
    color: "#1976d2",
    textAlign: "center",
    lineHeight: 20,
  },
  loginLink: {
    fontWeight: "bold",
    textDecorationLine: "underline",
    color: "#1976d2",
  },
});

export default CatalogScreen;
