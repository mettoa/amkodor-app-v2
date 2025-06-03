import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

// Флаг для предотвращения множественных показов алерта
let isShowingBlockAlert = false;

// Функция для показа алерта о блокировке
const showBlockAlert = (
  message = "Ваш аккаунт заблокирован. Обратитесь к администратору."
) => {
  if (isShowingBlockAlert) return;

  isShowingBlockAlert = true;
  Alert.alert(
    "Аккаунт заблокирован",
    message,
    [
      {
        text: "Понятно",
        onPress: () => {
          isShowingBlockAlert = false;
        },
        style: "default",
      },
    ],
    {
      cancelable: false,
      onDismiss: () => {
        isShowingBlockAlert = false;
      },
    }
  );
};

// Функция для очистки данных пользователя
const clearUserData = async () => {
  try {
    await AsyncStorage.multiRemove(["token", "user"]);
  } catch (error) {
    console.error("Ошибка очистки данных:", error);
  }
};

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Ошибка в запросе:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log("Response data:", response.data);
    return response;
  },
  async (error) => {
    console.error("Ошибка в ответе:", error.response?.data || error.message);

    // Проверяем различные случаи блокировки пользователя
    if (error.response) {
      const { status, data } = error.response;

      // Случай 1: Статус 403 и флаг is_blocked
      if (status === 403 && data?.is_blocked) {
        const message =
          data.message ||
          "Ваш аккаунт заблокирован. Обратитесь к администратору.";
        showBlockAlert(message);
        await clearUserData();

        // Создаем новую ошибку с понятным сообщением
        const blockError = new Error(message);
        blockError.isBlockError = true;
        return Promise.reject(blockError);
      }

      // Случай 2: Сообщение содержит информацию о блокировке
      if (
        data?.message &&
        (data.message.includes("заблокирован") ||
          data.message.includes("blocked") ||
          data.message.includes("Ваш аккаунт заблокирован"))
      ) {
        showBlockAlert(data.message);
        await clearUserData();

        const blockError = new Error(data.message);
        blockError.isBlockError = true;
        return Promise.reject(blockError);
      }

      // Случай 3: Ошибка "User is blocked"
      if (data?.error === "User is blocked") {
        const message =
          data.message ||
          "Ваш аккаунт заблокирован. Обратитесь к администратору.";
        showBlockAlert(message);
        await clearUserData();

        const blockError = new Error(message);
        blockError.isBlockError = true;
        return Promise.reject(blockError);
      }
    }

    return Promise.reject(error);
  }
);

export const IMAGE_BASE_URL = "http://localhost:3000";

export default api;
