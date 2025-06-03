import { useContext } from "react";
import { Alert } from "react-native";
import { CartContext } from "../contexts/CartContext";
import { OrderContext } from "../contexts/OrderContext";
import { AuthContext } from "../contexts/AuthContext";
import api from "../api";

const useCart = () => {
  const {
    cartItems,
    setCartItems,
    guestCartItems,
    setGuestCartItems,
    saveGuestCart,
    isGuestMode,
  } = useContext(CartContext);
  const { fetchOrders } = useContext(OrderContext);
  const { isAuthenticated, token, user } = useContext(AuthContext);

  const checkAuth = () => {
    if (!isAuthenticated || !token) {
      Alert.alert("Ошибка", "Необходимо авторизоваться.");
      return false;
    }
    return true;
  };

  const checkDeliveryAddress = () => {
    if (!user) {
      Alert.alert("Ошибка", "Данные пользователя не загружены.");
      return false;
    }

    // Проверяем наличие основных полей адреса
    const hasRequiredAddress = user.address && user.city && user.country;

    if (!hasRequiredAddress) {
      Alert.alert(
        "Адрес доставки не указан",
        "Для оформления заказа необходимо указать адрес доставки в профиле. Пожалуйста, заполните поля: адрес, город и страну.",
        [
          {
            text: "OK",
            style: "default",
          },
        ]
      );
      return false;
    }

    return true;
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }

    if (isAuthenticated && token) {
      // Авторизованный пользователь
      try {
        await api.put(`/carts/${productId}`, { quantity: newQuantity });
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.product_id === productId
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
        console.log(
          `Количество товара ${productId} обновлено до ${newQuantity}`
        );
      } catch (error) {
        console.error(
          "Ошибка обновления количества:",
          error.response?.data || error.message
        );
        Alert.alert("Ошибка", "Не удалось обновить количество товара");
      }
    } else {
      // Гостевой режим
      try {
        const newItems = guestCartItems.map((item) =>
          item.product_id === productId
            ? { ...item, quantity: newQuantity }
            : item
        );
        setGuestCartItems(newItems);
        await saveGuestCart(newItems);
        console.log(
          `Количество товара ${productId} обновлено в гостевой корзине до ${newQuantity}`
        );
      } catch (error) {
        console.error(
          "Ошибка обновления количества в гостевой корзине:",
          error
        );
        Alert.alert("Ошибка", "Не удалось обновить количество товара");
      }
    }
  };

  const removeItem = async (productId) => {
    Alert.alert(
      "Удалить товар",
      "Вы уверены, что хотите удалить этот товар из корзины?",
      [
        {
          text: "Отмена",
          style: "cancel",
        },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            if (isAuthenticated && token) {
              // Авторизованный пользователь
              try {
                await api.delete(`/carts/${productId}`);
                setCartItems((prevItems) =>
                  prevItems.filter((item) => item.product_id !== productId)
                );
                Alert.alert("Успех", "Товар удалён из корзины");
                console.log(`Товар ${productId} удален с сервера`);
              } catch (error) {
                console.error(
                  "Ошибка удаления с сервера:",
                  error.response?.data || error.message
                );
                Alert.alert("Ошибка", "Не удалось удалить товар");
              }
            } else {
              // Гостевой режим
              try {
                const newItems = guestCartItems.filter(
                  (item) => item.product_id !== productId
                );
                setGuestCartItems(newItems);
                await saveGuestCart(newItems);
                Alert.alert("Успех", "Товар удалён из корзины");
                console.log(`Товар ${productId} удален из гостевой корзины`);
              } catch (error) {
                console.error("Ошибка удаления из гостевой корзины:", error);
                Alert.alert("Ошибка", "Не удалось удалить товар");
              }
            }
          },
        },
      ]
    );
  };

  const clearCart = async () => {
    Alert.alert(
      "Очистить корзину",
      "Вы уверены, что хотите очистить всю корзину?",
      [
        {
          text: "Отмена",
          style: "cancel",
        },
        {
          text: "Очистить",
          style: "destructive",
          onPress: async () => {
            if (isAuthenticated && token) {
              // Авторизованный пользователь
              try {
                // Удаляем все товары с сервера
                for (const item of cartItems) {
                  await api.delete(`/carts/${item.product_id}`);
                }
                setCartItems([]);
                Alert.alert("Успех", "Корзина очищена");
              } catch (error) {
                console.error("Ошибка очистки корзины:", error);
                Alert.alert("Ошибка", "Не удалось очистить корзину");
              }
            } else {
              // Гостевой режим
              try {
                setGuestCartItems([]);
                await saveGuestCart([]);
                Alert.alert("Успех", "Корзина очищена");
              } catch (error) {
                console.error("Ошибка очистки гостевой корзины:", error);
                Alert.alert("Ошибка", "Не удалось очистить корзину");
              }
            }
          },
        },
      ]
    );
  };

  const handleCheckout = async () => {
    if (!checkAuth()) return;

    // Проверяем наличие адреса доставки
    if (!checkDeliveryAddress()) return;

    // Проверяем, есть ли товары в корзине
    if (cartItems.length === 0) {
      Alert.alert("Ошибка", "Корзина пуста");
      return;
    }

    try {
      await api.post("/orders", {});
      setCartItems([]);
      await fetchOrders();
      Alert.alert("Успех", "Заказ успешно оформлен!");
    } catch (error) {
      console.error(
        "Ошибка оформления заказа:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Ошибка",
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Не удалось оформить заказ"
      );
    }
  };

  const calculateTotalPrice = () => {
    const items = isAuthenticated ? cartItems : guestCartItems;
    return items
      .reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = item.quantity || 0;
        return sum + price * quantity;
      }, 0)
      .toFixed(2);
  };

  const calculateTotalItems = () => {
    const items = isAuthenticated ? cartItems : guestCartItems;
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const promptLogin = (navigation) => {
    Alert.alert(
      "Требуется авторизация",
      "Для оформления заказа необходимо войти в аккаунт",
      [
        {
          text: "Продолжить покупки",
          style: "cancel",
        },
        {
          text: "Войти",
          onPress: () => {
            if (navigation) {
              navigation.navigate("Login");
            }
          },
        },
      ]
    );
  };

  const handleGuestCheckout = (navigation) => {
    // Проверяем, есть ли товары в гостевой корзине
    if (guestCartItems.length === 0) {
      Alert.alert("Ошибка", "Корзина пуста");
      return;
    }

    promptLogin(navigation);
  };

  const getItemQuantity = (productId) => {
    const items = isAuthenticated ? cartItems : guestCartItems;
    const item = items.find((item) => item.product_id === productId);
    return item ? item.quantity : 0;
  };

  const isItemInCart = (productId) => {
    const items = isAuthenticated ? cartItems : guestCartItems;
    return items.some((item) => item.product_id === productId);
  };

  return {
    updateQuantity,
    removeItem,
    clearCart,
    handleCheckout: isAuthenticated ? handleCheckout : handleGuestCheckout,
    calculateTotalPrice,
    calculateTotalItems,
    promptLogin,
    getItemQuantity,
    isItemInCart,
    isGuestMode,
  };
};

export default useCart;
