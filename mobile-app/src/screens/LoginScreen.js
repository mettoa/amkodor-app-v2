import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import api from "../api";
import { AuthContext } from "../contexts/AuthContext";

const LoginScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  // Функция для показа уведомления о блокировке
  const showBlockAlert = (message) => {
    Alert.alert(
      "Доступ запрещен",
      message ||
        "Ваш аккаунт заблокирован администратором. Для разблокировки обратитесь в службу поддержки.",
      [
        {
          text: "Понятно",
          style: "default",
        },
      ],
      { cancelable: false }
    );
  };

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !username)) {
      Alert.alert("Ошибка", "Пожалуйста, заполните все поля");
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin
        ? { email, password }
        : { username, email, password };

      const response = await api.post(endpoint, payload);
      console.log("Login/Register response:", response.data);

      if (response.data.token) {
        const { token, password, ...userData } = response.data;
        console.log("User data to be sent to login:", userData);

        // Проверяем статус блокировки пользователя перед входом
        if (userData.is_blocked) {
          showBlockAlert(
            "Ваш аккаунт заблокирован администратором. Вход в систему невозможен. Обратитесь в службу поддержки для разблокировки."
          );
          return;
        }

        await login(token, userData);

        if (!isLogin) {
          Alert.alert("Успех", "Регистрация прошла успешно!");
        }

        // Навигация после успешной авторизации
        // Если пользователь пришел из другого экрана, возвращаемся назад
        // Иначе переходим к каталогу
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          // Если нельзя вернуться назад, сбрасываем стек навигации и переходим к каталогу
          navigation.reset({
            index: 0,
            routes: [{ name: "Tabs" }],
          });
        }
      }
    } catch (error) {
      console.error("Login/Register error:", error);

      // Проверяем различные типы ошибок блокировки
      if (
        error.isBlockError ||
        error.response?.data?.is_blocked ||
        error.response?.data?.message?.includes("заблокирован") ||
        error.response?.data?.message?.includes("blocked") ||
        error.response?.data?.error === "User is blocked"
      ) {
        const blockMessage =
          error.response?.data?.message ||
          error.message ||
          "Ваш аккаунт заблокирован администратором. Вход в систему невозможен.";
        showBlockAlert(blockMessage);
        return;
      }

      // Проверяем статус 403 (Forbidden)
      if (error.response?.status === 403) {
        showBlockAlert("Доступ запрещен. Возможно, ваш аккаунт заблокирован.");
        return;
      }

      // Специальная обработка для неверных учетных данных
      if (error.response?.status === 401) {
        Alert.alert(
          "Ошибка входа",
          "Неверный email или пароль. Проверьте введенные данные и попробуйте снова."
        );
        return;
      }

      // Обработка других ошибок
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Не удалось подключиться к серверу. Проверьте интернет-соединение.";

      Alert.alert("Ошибка", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? "Вход" : "Регистрация"}</Text>
      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          editable={!loading}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />
      <Button
        title={
          loading ? "Загрузка..." : isLogin ? "Войти" : "Зарегистрироваться"
        }
        onPress={handleSubmit}
        disabled={loading}
      />
      <TouchableOpacity onPress={() => setIsLogin(!isLogin)} disabled={loading}>
        <Text style={[styles.toggleText, loading && styles.disabledText]}>
          {isLogin
            ? "Нет аккаунта? Зарегистрируйтесь"
            : "Уже есть аккаунт? Войдите"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  toggleText: {
    marginTop: 20,
    color: "blue",
    textAlign: "center",
  },
  disabledText: {
    opacity: 0.5,
  },
});

export default LoginScreen;
