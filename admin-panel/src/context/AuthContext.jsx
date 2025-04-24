import { createContext, useState, useEffect } from "react";
import { message } from "antd";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await axios.get("/users/profile/me");

        if (response.data && response.data.role === "admin") {
          setUser(response.data);
        } else {
          message.error(
            "Только администраторы имеют доступ к панели управления"
          );
          localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
        }
      } catch (error) {
        console.error("Ошибка проверки аутентификации:", error);
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post("/auth/login", { email, password });

      if (response.data && response.data.role === "admin") {
        setUser(response.data);
        localStorage.setItem("token", response.data.token);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.token}`;
        message.success("Успешный вход в систему");
        return true;
      } else {
        message.error("Только администраторы имеют доступ к панели управления");
        return false;
      }
    } catch (error) {
      console.error("Ошибка входа:", error);
      message.error(error.response?.data?.error || "Ошибка входа в систему");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    message.success("Выход из системы выполнен успешно");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        initialized,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
