import React, { useEffect, useContext } from "react";
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { AuthContext } from "../contexts/AuthContext";
import { OrderContext } from "../contexts/OrderContext";

import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileForm from "../components/profile/ProfileForm";
import OrdersSection from "../components/profile/OrdersSection";
import AuthRequired from "../components/shared/AuthRequired";

import useProfile from "../hooks/useProfile";
import useOrders from "../hooks/useOrders";

import { formatDate, getStatusColor, getOrderTotal } from "../utils/formatters";

const ProfileScreen = () => {
  const {
    isAuthenticated,
    token,
    loading: authLoading,
    logout,
    user,
  } = useContext(AuthContext);

  const { fetchOrders, loading: ordersLoading } = useContext(OrderContext);

  const {
    profileData,
    errors,
    isSubmitting,
    isEditingProfile,
    setIsEditingProfile,
    handleInputChange,
    handleSubmitProfile,
  } = useProfile();

  const { orders, expandedOrder, toggleOrderDetails, handleCancelOrder } =
    useOrders();

  useEffect(() => {
    if (!authLoading && isAuthenticated && token) {
      console.log("Запуск fetchOrders в ProfileScreen:", {
        isAuthenticated,
        token,
      });
      fetchOrders();
    }
  }, [authLoading, isAuthenticated, token, fetchOrders]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <AuthRequired loadingState={ordersLoading}>
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
            <OrdersSection
              orders={orders}
              expandedOrder={expandedOrder}
              toggleOrderDetails={toggleOrderDetails}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
              getOrderTotal={getOrderTotal}
              cancelOrder={handleCancelOrder}
            />
          )}
        </ScrollView>
      </AuthRequired>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
});

export default ProfileScreen;
