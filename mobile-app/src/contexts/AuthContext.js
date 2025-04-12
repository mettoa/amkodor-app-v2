import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");
        console.log("AsyncStorage:", { storedToken, storedUser });
        if (storedToken) {
          setToken(storedToken);
          setIsAuthenticated(true);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, []);

  const login = async (newToken, userData) => {
    try {
      console.log("Login данные:", { newToken, userData });
      await AsyncStorage.setItem("token", newToken);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Ошибка сохранения данных:", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Ошибка удаления данных:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, token, user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
