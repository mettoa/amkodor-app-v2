import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import api from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Функция для показа Alert с блокировкой
  const showBlockAlert = (
    message = "Ваш аккаунт заблокирован. Обратитесь к администратору."
  ) => {
    Alert.alert(
      "Аккаунт заблокирован",
      message,
      [
        {
          text: "Понятно",
          style: "default",
        },
      ],
      { cancelable: false }
    );
  };

  // Функция для проверки блокировки пользователя
  const checkUserBlockStatus = async (userData, showMessage = true) => {
    try {
      if (!userData.user_id) return false;

      console.log("Checking user block status for:", userData.user_id);
      const response = await api.get(`/users/${userData.user_id}`);

      if (response.data && response.data.is_blocked) {
        console.log("User is blocked:", response.data);
        if (showMessage) {
          showBlockAlert(
            "Ваш аккаунт заблокирован. Обратитесь к администратору."
          );
        }
        await logout();
        return true;
      }

      // Обновляем данные пользователя, если они изменились
      if (response.data) {
        await AsyncStorage.setItem("user", JSON.stringify(response.data));
        setUser(response.data);
      }

      return false;
    } catch (error) {
      console.error("Error checking user block status:", error);

      // Если это ошибка блокировки, которую уже обработал interceptor
      if (error.isBlockError) {
        // Алерт уже показан в interceptor, просто выходим
        await logout();
        return true;
      }

      // Проверяем различные типы ошибок, которые могут указывать на блокировку
      if (
        error.response?.status === 403 ||
        error.response?.status === 401 ||
        error.response?.data?.message?.includes("заблокирован") ||
        error.response?.data?.message?.includes("blocked")
      ) {
        console.log("User appears to be blocked based on error response");
        if (showMessage) {
          showBlockAlert(
            error.response?.data?.message ||
              "Ваш аккаунт заблокирован. Обратитесь к администратору."
          );
        }
        await logout();
        return true;
      }

      return false;
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");
        console.log("AsyncStorage on startup:", {
          token: storedToken ? "exists" : "missing",
          user: storedUser ? JSON.parse(storedUser) : "missing",
        });

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log("Parsed user from AsyncStorage:", parsedUser);

          setToken(storedToken);
          setIsAuthenticated(true);

          // Проверяем статус блокировки
          const isBlocked = await checkUserBlockStatus(parsedUser, true);

          if (!isBlocked) {
            setUser(parsedUser);
          }
        }
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);

        // Если это не ошибка блокировки, показываем общую ошибку
        if (!error.isBlockError) {
          await logout();
          Alert.alert(
            "Ошибка",
            "Произошла ошибка при загрузке данных. Пожалуйста, войдите снова.",
            [{ text: "OK" }]
          );
        }
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, []);

  const login = async (newToken, userData) => {
    try {
      console.log("Received userData for login:", userData);
      if (!userData || !userData.email || !userData.username) {
        throw new Error("Неверные данные пользователя");
      }

      if (userData.is_blocked) {
        const blockMsg =
          "Ваш аккаунт заблокирован. Обратитесь к администратору.";
        showBlockAlert(blockMsg);
        throw new Error(blockMsg);
      }

      await AsyncStorage.multiSet([
        ["token", newToken],
        ["user", JSON.stringify(userData)],
      ]);

      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);

      console.log("User data saved to AsyncStorage:", userData);

      Alert.alert("Успешно", "Вы успешно вошли в систему!", [{ text: "OK" }]);
    } catch (error) {
      console.error("Login error:", error);

      if (error.message && error.message.includes("заблокирован")) {
        showBlockAlert(error.message);
      } else if (!error.isBlockError) {
        Alert.alert(
          "Ошибка входа",
          "Не удалось войти в систему. Проверьте данные и попробуйте снова.",
          [{ text: "OK" }]
        );
      }

      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("Logging out user");
      await AsyncStorage.multiRemove(["token", "user"]);
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Ошибка удаления данных:", error);
    }
  };
  const checkUserStatus = async () => {
    try {
      const response = await api.get("/user/status");
      if (response.data.is_blocked) {
        showBlockAlert(
          "Ваш аккаунт был заблокирован администратором. Вы будете автоматически разлогинены."
        );
        setTimeout(() => {
          logout();
        }, 2000);
      }
    } catch (error) {
      console.error("Ошибка проверки статуса пользователя:", error);
    }
  };

  const updateUserProfile = async (updatedUserData) => {
    try {
      console.log("Updating user profile with:", updatedUserData);

      if (updatedUserData.is_blocked) {
        showBlockAlert("Ваш аккаунт был заблокирован администратором.");
        await logout();
        return;
      }

      await AsyncStorage.setItem("user", JSON.stringify(updatedUserData));
      setUser(updatedUserData);

      Alert.alert("Профиль обновлен", "Данные профиля успешно обновлены", [
        { text: "OK" },
      ]);
    } catch (error) {
      console.error("Ошибка обновления данных профиля:", error);

      if (!error.isBlockError) {
        Alert.alert(
          "Ошибка",
          "Не удалось обновить профиль. Попробуйте снова.",
          [{ text: "OK" }]
        );
      }
    }
  };

  const refreshUserStatus = async () => {
    if (user && isAuthenticated) {
      await checkUserBlockStatus(user, true);
    }
  };

  const showNotification = (title, message, buttons = [{ text: "OK" }]) => {
    Alert.alert(title, message, buttons);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        user,
        login,
        logout,
        loading,
        updateUserProfile,
        refreshUserStatus,
        showNotification,
        checkUserStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
