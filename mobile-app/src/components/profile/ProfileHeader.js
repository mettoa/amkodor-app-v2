import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const ProfileHeader = ({ user, onEditProfilePress, onLogoutPress }) => {
  return (
    <View style={styles.userInfo}>
      <Text style={styles.greeting}>
        Здравствуйте, {user?.username || "Пользователь"}!
      </Text>
      <Text style={styles.userEmail}>{user?.email || "Нет email"}</Text>
      {user?.address && (
        <Text style={styles.userAddress}>Адрес: {user.address}</Text>
      )}

      <View style={styles.profileActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={onEditProfilePress}
        >
          <Text style={styles.editButtonText}>Редактировать профиль</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  userInfo: {
    padding: 20,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 3,
  },
  userAddress: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
  },
  profileActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  editButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    padding: 15,
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
