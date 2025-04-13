import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

const LoadingIndicator = ({ message = "Загрузка..." }) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007bff" />
      <Text>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoadingIndicator;
