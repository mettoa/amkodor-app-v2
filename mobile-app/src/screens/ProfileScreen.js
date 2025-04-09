import React, { useContext } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { AuthContext } from "../contexts/AuthContext";

const ProfileScreen = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Данные пользователя недоступны</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Здравствуйте, {user.username}!</Text>
      <Text style={styles.info}>Username: {user.username}</Text>
      <Text style={styles.info}>Email: {user.email}</Text>
      <Button title="Выйти" onPress={logout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  greeting: {
    fontSize: 24,
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default ProfileScreen;
