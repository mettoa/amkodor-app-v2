import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api";

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
        console.log("AsyncStorage on startup:", {
          token: storedToken ? "exists" : "missing",
          user: storedUser ? JSON.parse(storedUser) : "missing",
        });

        if (storedToken) {
          setToken(storedToken);
          setIsAuthenticated(true);

          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            console.log("Parsed user from AsyncStorage:", parsedUser);

            if (!parsedUser.address && parsedUser.user_id) {
              try {
                console.log("User data missing address, fetching fresh data");
                const response = await api.get(`/users/${parsedUser.user_id}`);
                if (response.data) {
                  console.log("Fresh user data fetched:", response.data);
                  await AsyncStorage.setItem(
                    "user",
                    JSON.stringify(response.data)
                  );
                  setUser(response.data);
                } else {
                  setUser(parsedUser);
                }
              } catch (fetchError) {
                console.error("Error fetching fresh user data:", fetchError);
                setUser(parsedUser);
              }
            } else {
              setUser(parsedUser);
            }
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
      console.log("Received userData for login:", userData);
      if (!userData || !userData.email || !userData.username) {
        throw new Error("Invalid user data received");
      }
      await AsyncStorage.multiSet([
        ["token", newToken],
        ["user", JSON.stringify(userData)],
      ]);
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      console.log("User data saved to AsyncStorage:", userData);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
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

  const updateUserProfile = async (updatedUserData) => {
    try {
      console.log("Updating user profile with:", updatedUserData);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUserData));
      setUser(updatedUserData);
    } catch (error) {
      console.error("Ошибка обновления данных профиля:", error);
    }
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
