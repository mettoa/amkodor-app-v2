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
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";

const LoginScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !username)) {
      Alert.alert("Ошибка", "Пожалуйста, заполните все поля");
      return;
    }

    try {
      if (isLogin) {
        const response = await axios.post("http://localhost:3000/auth/login", {
          email,
          password,
        });
        if (response.data.token) {
          const userData = {
            username: response.data.username,
            email: response.data.email,
          };
          login(response.data.token, userData);
        } else {
          Alert.alert("Ошибка", "Неверные учетные данные");
        }
      } else {
        const response = await axios.post(
          "http://localhost:3000/auth/register",
          {
            username,
            email,
            password,
          }
        );
        if (response.data.token) {
          const userData = {
            username: response.data.username,
            email: response.data.email,
          };
          login(response.data.token, userData);
          Alert.alert("Успех", "Регистрация прошла успешно!");
        } else {
          Alert.alert("Ошибка", "Не удалось зарегистрироваться");
        }
      }
    } catch (error) {
      console.error(
        "Ошибка:",
        error.response ? error.response.data : error.message
      );
      Alert.alert("Ошибка", "Не удалось подключиться к серверу");
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
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={isLogin ? "Войти" : "Зарегистрироваться"}
        onPress={handleSubmit}
      />
      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.toggleText}>
          {isLogin
            ? "Нет аккаунта? Зарегистрируйтесь"
            : "Уже есть аккаунт? Войдите"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  toggleText: { marginTop: 20, color: "blue", textAlign: "center" },
});

export default LoginScreen;
