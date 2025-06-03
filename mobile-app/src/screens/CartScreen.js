import React, { useEffect, useContext } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  RefreshControl,
} from "react-native";
import { CartContext } from "../contexts/CartContext";
import { AuthContext } from "../contexts/AuthContext";

import CartItem from "../components/cart/CartItem";
import CartFooter from "../components/cart/CartFooter";
import EmptyCart from "../components/cart/EmptyCart";
import LoadingIndicator from "../components/shared/LoadingIndicator";

import useCart from "../hooks/useCart";

const CartScreen = ({ navigation }) => {
  const { cartItems, fetchCart, loading, isGuestMode } =
    useContext(CartContext);
  const {
    isAuthenticated,
    token,
    loading: authLoading,
  } = useContext(AuthContext);

  const {
    updateQuantity,
    removeItem,
    handleCheckout,
    calculateTotalPrice,
    calculateTotalItems,
    clearCart,
  } = useCart();

  useEffect(() => {
    if (!authLoading && isAuthenticated && token) {
      fetchCart();
    }
  }, [authLoading, isAuthenticated, token, fetchCart]);

  const handleCheckoutPress = () => {
    if (isAuthenticated) {
      handleCheckout();
    } else {
      handleCheckout(navigation); // Передаем navigation для гостевого режима
    }
  };

  const handleRefresh = async () => {
    if (isAuthenticated && token) {
      await fetchCart();
    }
  };

  const renderGuestNotice = () => {
    if (isAuthenticated) return null;

    return (
      <View style={styles.guestNotice}>
        <Text style={styles.guestNoticeText}>
          🛒 Вы используете гостевой режим.{" "}
          <Text
            style={styles.loginLink}
            onPress={() => navigation.navigate("Login")}
          >
            Войдите в аккаунт
          </Text>{" "}
          для оформления заказа и синхронизации корзины.
        </Text>
      </View>
    );
  };

  const renderEmptyCartContent = () => (
    <View style={styles.container}>
      <EmptyCart />
      {!isAuthenticated && (
        <View style={styles.guestSection}>
          <Text style={styles.guestText}>
            Войдите в аккаунт, чтобы синхронизировать корзину между устройствами
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginButtonText}>Войти в аккаунт</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderCartHeader = () => {
    if (cartItems.length === 0) return null;

    return (
      <View style={styles.cartHeader}>
        <Text style={styles.cartHeaderText}>
          В корзине: {calculateTotalItems()}{" "}
          {getItemsWord(calculateTotalItems())}
        </Text>
        <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Очистить</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const getItemsWord = (count) => {
    if (count % 10 === 1 && count % 100 !== 11) return "товар";
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100))
      return "товара";
    return "товаров";
  };

  if (loading && cartItems.length === 0) {
    return <LoadingIndicator message="Загрузка корзины..." />;
  }

  if (cartItems.length === 0) {
    return renderEmptyCartContent();
  }

  return (
    <View style={styles.container}>
      {renderGuestNotice()}
      {renderCartHeader()}

      <FlatList
        data={cartItems}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
            isGuestMode={isGuestMode}
          />
        )}
        keyExtractor={(item) => item.product_id.toString()}
        style={styles.cartList}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            enabled={isAuthenticated}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <CartFooter
        totalPrice={calculateTotalPrice()}
        itemsCount={calculateTotalItems()}
        onCheckout={handleCheckoutPress}
        isGuest={!isAuthenticated}
        loading={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  cartList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  cartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  cartHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dc3545",
  },
  clearButtonText: {
    color: "#dc3545",
    fontSize: 14,
    fontWeight: "500",
  },
  guestSection: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  guestText: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#007bff",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  guestNotice: {
    backgroundColor: "#fff3cd",
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  guestNoticeText: {
    fontSize: 14,
    color: "#856404",
    textAlign: "center",
    lineHeight: 20,
  },
  loginLink: {
    fontWeight: "600",
    textDecorationLine: "underline",
    color: "#007bff",
  },
});

export default CartScreen;
