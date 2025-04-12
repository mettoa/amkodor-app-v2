import React, { useEffect, useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AuthContext } from "../contexts/AuthContext";
import { OrderContext } from "../contexts/OrderContext";
import api from "../api";

import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileForm from "../components/profile/ProfileForm";
import OrdersList from "../components/profile/OrdersList";
import { formatDate, getStatusColor, getOrderTotal } from "../utils/formatters";

const ProfileScreen = () => {
  const {
    user,
    isAuthenticated,
    token,
    loading: authLoading,
    logout,
    updateUserProfile,
  } = useContext(AuthContext);
  const {
    orders,
    fetchOrders,
    loading: ordersLoading,
    setOrders,
  } = useContext(OrderContext);

  const [expandedOrder, setExpandedOrder] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated && token) {
      console.log("Запуск fetchOrders в ProfileScreen:", {
        isAuthenticated,
        token,
      });
      fetchOrders();

      if (user) {
        setProfileData({
          username: user.username || "",
          email: user.email || "",
          password: "",
          newPassword: "",
          confirmPassword: "",
          address: user.address || "",
        });
      }
    }
  }, [authLoading, isAuthenticated, token, fetchOrders, user]);

  const handleInputChange = (field, value) => {
    setProfileData({
      ...profileData,
      [field]: value,
    });

    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!profileData.username.trim()) {
      newErrors.username = "Имя пользователя обязательно";
    } else if (profileData.username.length < 3) {
      newErrors.username = "Имя пользователя должно быть не менее 3 символов";
    }

    if (!profileData.email.trim()) {
      newErrors.email = "Email обязателен";
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = "Некорректный email";
    }

    if (profileData.newPassword) {
      if (profileData.newPassword.length < 6) {
        newErrors.newPassword = "Пароль должен быть не менее 6 символов";
      }

      if (!profileData.confirmPassword) {
        newErrors.confirmPassword = "Подтвердите новый пароль";
      } else if (profileData.newPassword !== profileData.confirmPassword) {
        newErrors.confirmPassword = "Пароли не совпадают";
      }

      if (!profileData.password) {
        newErrors.password =
          "Введите текущий пароль для подтверждения изменений";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        username: profileData.username,
        email: profileData.email,
        address: profileData.address,
      };

      if (profileData.newPassword) {
        updateData.currentPassword = profileData.password;
        updateData.newPassword = profileData.newPassword;
      }

      const response = await api.put("/users/profile", updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (typeof updateUserProfile === "function") {
        updateUserProfile({
          ...user,
          username: profileData.username,
          email: profileData.email,
          address: profileData.address,
        });
      }

      Alert.alert("Успех", "Профиль успешно обновлен");
      setIsEditingProfile(false);

      setProfileData({
        ...profileData,
        password: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error(
        "Ошибка при обновлении профиля:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Ошибка",
        error.response?.data?.message || "Не удалось обновить профиль"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = (orderId) => {
    Alert.alert(
      "Подтвердите отмену",
      "Вы уверены, что хотите отменить этот заказ?",
      [
        {
          text: "Отмена",
          style: "cancel",
        },
        {
          text: "Подтвердить",
          onPress: async () => {
            try {
              await api.put(
                `/orders/${orderId}/status`,
                { status: "Cancelled" },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              setOrders((prevOrders) =>
                prevOrders.map((order) =>
                  order.order_id === orderId
                    ? { ...order, status: "Cancelled" }
                    : order
                )
              );
            } catch (error) {
              console.error("Ошибка при отмене заказа:", error.message);
              Alert.alert("Ошибка", "Не удалось отменить заказ.");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (authLoading || ordersLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Загрузка...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Пожалуйста, войдите в аккаунт</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        {isEditingProfile ? (
          <ProfileForm
            profileData={profileData}
            handleInputChange={handleInputChange}
            errors={errors}
            isSubmitting={isSubmitting}
            handleSubmitProfile={handleSubmitProfile}
            setIsEditingProfile={setIsEditingProfile}
            logout={logout}
          />
        ) : (
          <ProfileHeader
            user={user}
            onEditProfilePress={() => setIsEditingProfile(true)}
            onLogoutPress={logout}
          />
        )}

        {!isEditingProfile && (
          <>
            <Text style={styles.sectionTitle}>Ваши заказы</Text>
            <OrdersList
              orders={orders}
              expandedOrder={expandedOrder}
              toggleOrderDetails={toggleOrderDetails}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
              getOrderTotal={getOrderTotal}
              cancelOrder={handleCancelOrder}
            />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    marginTop: 10,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
});

export default ProfileScreen;
