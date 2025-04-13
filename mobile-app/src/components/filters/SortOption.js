import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SortOption = ({ label, option, selectedOption, onSelect }) => {
  return (
    <TouchableOpacity
      style={styles.checkboxItem}
      onPress={() => onSelect(option)}
    >
      <Ionicons
        name={selectedOption === option ? "checkbox" : "checkbox-outline"}
        size={24}
        color="#000"
      />
      <Text style={styles.checkboxText}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },
  checkboxText: { fontSize: 16, marginLeft: 10 },
});

export default SortOption;
