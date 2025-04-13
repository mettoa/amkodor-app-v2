import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { AuthContext } from "../../contexts/AuthContext";
import LoadingIndicator from "./LoadingIndicator";

const AuthRequired = ({ children, loadingState }) => {
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);

  if (authLoading || loadingState) {
    return <LoadingIndicator message="Загрузка..." />;
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Пожалуйста, войдите в аккаунт</Text>
      </View>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
});

export default AuthRequired;
