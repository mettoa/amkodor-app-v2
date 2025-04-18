import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const ProfileHeader = ({ user, onEditProfilePress, onLogoutPress }) => {
  console.log("User in ProfileHeader:", user);
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Профиль пользователя</Text>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Основная информация</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Имя пользователя:</Text>
          <Text style={styles.infoValue}>{user?.username || "Не указано"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{user?.email || "Не указано"}</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Адрес доставки</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Адрес:</Text>
          <Text style={styles.infoValue}>{user?.address || "Не указан"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Город:</Text>
          <Text style={styles.infoValue}>{user?.city || "Не указан"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Область/регион:</Text>
          <Text style={styles.infoValue}>{user?.state || "Не указан"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Почтовый индекс:</Text>
          <Text style={styles.infoValue}>
            {user?.postal_code || "Не указан"}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Страна:</Text>
          <Text style={styles.infoValue}>{user?.country || "Не указана"}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={onEditProfilePress}
        >
          <Text style={styles.buttonText}>Редактировать профиль</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogoutPress}>
          <Text style={styles.logoutButtonText}>Выйти</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  infoSection: {
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
    width: 150,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  editButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 5,
    flex: 3,
    marginRight: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    padding: 12,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileHeader;
