import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CategoryCheckbox = ({ item, isSelected, onToggle }) => {
  return (
    <TouchableOpacity
      style={styles.checkboxItem}
      onPress={() => onToggle(item.category_id)}
    >
      <Ionicons
        name={isSelected ? "checkbox" : "checkbox-outline"}
        size={24}
        color="#000"
      />
      <Text style={styles.checkboxText}>{item.name}</Text>
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

export default CategoryCheckbox;
