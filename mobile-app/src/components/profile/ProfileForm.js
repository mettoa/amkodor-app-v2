import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

const ProfileForm = ({
  profileData,
  handleInputChange,
  errors,
  isSubmitting,
  handleSubmitProfile,
  setIsEditingProfile,
  logout,
}) => {
  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Редактирование профиля</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Имя пользователя</Text>
        <TextInput
          style={[styles.input, errors.username && styles.inputError]}
          value={profileData.username}
          onChangeText={(text) => handleInputChange("username", text)}
          placeholder="Введите имя пользователя"
        />
        {errors.username && (
          <Text style={styles.errorText}>{errors.username}</Text>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={profileData.email}
          onChangeText={(text) => handleInputChange("email", text)}
          placeholder="Введите email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Адрес</Text>
        <TextInput
          style={styles.input}
          value={profileData.address}
          onChangeText={(text) => handleInputChange("address", text)}
          placeholder="Введите адрес доставки"
          multiline
        />
      </View>

      <Text style={styles.sectionTitle}>Изменение пароля</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Текущий пароль</Text>
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          value={profileData.password}
          onChangeText={(text) => handleInputChange("password", text)}
          placeholder="Введите текущий пароль"
          secureTextEntry
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Новый пароль</Text>
        <TextInput
          style={[styles.input, errors.newPassword && styles.inputError]}
          value={profileData.newPassword}
          onChangeText={(text) => handleInputChange("newPassword", text)}
          placeholder="Введите новый пароль"
          secureTextEntry
        />
        {errors.newPassword && (
          <Text style={styles.errorText}>{errors.newPassword}</Text>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Подтверждение пароля</Text>
        <TextInput
          style={[styles.input, errors.confirmPassword && styles.inputError]}
          value={profileData.confirmPassword}
          onChangeText={(text) => handleInputChange("confirmPassword", text)}
          placeholder="Подтвердите новый пароль"
          secureTextEntry
        />
        {errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        )}
      </View>

      <View style={styles.formActions}>
        <TouchableOpacity
          style={styles.cancelFormButton}
          onPress={() => setIsEditingProfile(false)}
        >
          <Text style={styles.cancelFormButtonText}>Отмена</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSubmitProfile}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Сохранить</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#dc3545",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 14,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    marginTop: 10,
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelFormButton: {
    backgroundColor: "#6c757d",
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  cancelFormButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileForm;
