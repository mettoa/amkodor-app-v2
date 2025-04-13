import React, { useEffect, useContext } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { CartContext } from "../contexts/CartContext";
import { AuthContext } from "../contexts/AuthContext";

import CartItem from "../components/cart/CartItem";
import CartFooter from "../components/cart/CartFooter";
import EmptyCart from "../components/cart/EmptyCart";
import LoadingIndicator from "../components/shared/LoadingIndicator";

import useCart from "../hooks/useCart";

const CartScreen = () => {
  const { cartItems, fetchCart, loading } = useContext(CartContext);
  const {
    isAuthenticated,
    token,
    loading: authLoading,
  } = useContext(AuthContext);

  const { updateQuantity, removeItem, handleCheckout, calculateTotalPrice } =
    useCart();

  useEffect(() => {
    if (!authLoading && isAuthenticated && token) {
      fetchCart();
    }
  }, [authLoading, isAuthenticated, token, fetchCart]);

  if (loading || authLoading) {
    return <LoadingIndicator message="Загрузка корзины..." />;
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyCart />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        )}
        keyExtractor={(item) => item.product_id.toString()}
        style={styles.cartList}
      />
      <CartFooter
        totalPrice={calculateTotalPrice()}
        onCheckout={handleCheckout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  cartList: {
    marginBottom: 20,
  },
});

export default CartScreen;
