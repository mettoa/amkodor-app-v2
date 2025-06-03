import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { AuthContext } from "./AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated, token } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [guestCartItems, setGuestCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Загрузка гостевой корзины при инициализации
  useEffect(() => {
    const loadGuestCart = async () => {
      try {
        const guestCart = await AsyncStorage.getItem("guestCart");
        if (guestCart) {
          const parsedCart = JSON.parse(guestCart);
          setGuestCartItems(parsedCart);
          console.log("Загружена гостевая корзина:", parsedCart);
        }
      } catch (error) {
        console.error("Ошибка загрузки гостевой корзины:", error);
      }
    };
    loadGuestCart();
  }, []);

  // Синхронизация гостевой корзины с сервером при авторизации
  useEffect(() => {
    const syncGuestCartToServer = async () => {
      if (isAuthenticated && token && guestCartItems.length > 0) {
        try {
          console.log(
            "Начинаем синхронизацию гостевой корзины с сервером:",
            guestCartItems
          );
          setLoading(true);

          // Добавляем каждый товар из гостевой корзины на сервер
          for (const item of guestCartItems) {
            try {
              await api.post(`/carts/${item.product_id}`, {
                quantity: item.quantity,
              });
              console.log(`Товар ${item.product_id} добавлен на сервер`);
            } catch (error) {
              console.error(
                `Ошибка добавления товара ${item.product_id}:`,
                error
              );
              // Продолжаем синхронизацию остальных товаров
            }
          }

          // Очищаем гостевую корзину после синхронизации
          setGuestCartItems([]);
          await AsyncStorage.removeItem("guestCart");

          // Загружаем обновленную корзину с сервера
          await fetchCart();

          console.log("Гостевая корзина успешно синхронизирована");
        } catch (error) {
          console.error("Ошибка синхронизации гостевой корзины:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    // Добавляем небольшую задержку для корректной синхронизации
    const timeoutId = setTimeout(() => {
      syncGuestCartToServer();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, token, guestCartItems.length]);

  // Очистка серверной корзины при выходе из аккаунта
  useEffect(() => {
    if (!isAuthenticated) {
      setCartItems([]);
    }
  }, [isAuthenticated]);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !token) {
      console.log("Пользователь не авторизован - корзина не загружается");
      setCartItems([]);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get("/carts");
      console.log("Корзина загружена с сервера:", response.data);
      const newItems = response.data.data || response.data;

      setCartItems((prevItems) => {
        // Обновляем только если данные действительно изменились
        if (JSON.stringify(prevItems) !== JSON.stringify(newItems)) {
          return newItems;
        }
        return prevItems;
      });
    } catch (error) {
      console.error(
        "Ошибка загрузки корзины:",
        error.response?.data || error.message
      );
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  const saveGuestCart = async (items) => {
    try {
      await AsyncStorage.setItem("guestCart", JSON.stringify(items));
      console.log("Гостевая корзина сохранена:", items);
    } catch (error) {
      console.error("Ошибка сохранения гостевой корзины:", error);
    }
  };

  const addToCart = useCallback(
    async (productId, quantity = 1) => {
      if (isAuthenticated && token) {
        // Авторизованный пользователь - добавляем на сервер
        try {
          setLoading(true);
          const response = await api.post(`/carts/${productId}`, { quantity });
          console.log("Товар добавлен в корзину на сервере:", response.data);
          await fetchCart();
          return { success: true, message: "Товар добавлен в корзину" };
        } catch (error) {
          console.error(
            "Ошибка добавления на сервер:",
            error.response?.data || error.message
          );
          return {
            success: false,
            message:
              error.response?.data?.message ||
              "Не удалось добавить товар в корзину",
          };
        } finally {
          setLoading(false);
        }
      } else {
        // Гостевой режим - добавляем в локальную корзину
        try {
          // Получаем информацию о продукте
          const productResponse = await api.get(`/products/${productId}`);
          const product = productResponse.data;

          setGuestCartItems((prevItems) => {
            const existingItem = prevItems.find(
              (item) => item.product_id === productId
            );
            let newItems;

            if (existingItem) {
              // Увеличиваем количество существующего товара
              newItems = prevItems.map((item) =>
                item.product_id === productId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              );
            } else {
              // Добавляем новый товар
              const newItem = {
                product_id: productId,
                productname: product.productname || product.name,
                price: product.price,
                image_url: product.image_url,
                quantity: quantity,
              };
              newItems = [...prevItems, newItem];
            }

            saveGuestCart(newItems);
            return newItems;
          });

          console.log("Товар добавлен в гостевую корзину");
          return { success: true, message: "Товар добавлен в корзину" };
        } catch (error) {
          console.error("Ошибка добавления в гостевую корзину:", error);
          return {
            success: false,
            message: "Не удалось добавить товар в корзину",
          };
        }
      }
    },
    [isAuthenticated, token, fetchCart]
  );

  // Функция для очистки гостевой корзины
  const clearGuestCart = useCallback(async () => {
    try {
      setGuestCartItems([]);
      await AsyncStorage.removeItem("guestCart");
      console.log("Гостевая корзина очищена");
    } catch (error) {
      console.error("Ошибка очистки гостевой корзины:", error);
    }
  }, []);

  // Функция для получения количества товаров в корзине
  const getCartItemsCount = useCallback(() => {
    const items = isAuthenticated ? cartItems : guestCartItems;
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
  }, [isAuthenticated, cartItems, guestCartItems]);

  // Возвращаем соответствующие элементы корзины в зависимости от статуса авторизации
  const currentCartItems = isAuthenticated ? cartItems : guestCartItems;

  return (
    <CartContext.Provider
      value={{
        cartItems: currentCartItems,
        setCartItems: isAuthenticated ? setCartItems : setGuestCartItems,
        guestCartItems,
        setGuestCartItems,
        fetchCart,
        addToCart,
        loading,
        saveGuestCart,
        clearGuestCart,
        getCartItemsCount,
        isGuestMode: !isAuthenticated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
