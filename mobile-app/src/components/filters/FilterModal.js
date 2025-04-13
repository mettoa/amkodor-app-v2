import React from "react";
import { View, Text, FlatList, Button, StyleSheet, Modal } from "react-native";
import CategoryCheckbox from "./CategoryCheckbox";
import SortOption from "./SortOption";

const FilterModal = ({
  visible,
  onClose,
  onReset,
  categories,
  selectedCategories,
  onToggleCategory,
  sortOption,
  onSortChange,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Фильтры и сортировка</Text>

          <Text style={styles.sectionTitle}>Категории</Text>
          <FlatList
            data={categories}
            renderItem={({ item }) => (
              <CategoryCheckbox
                item={item}
                isSelected={selectedCategories.has(item.category_id)}
                onToggle={onToggleCategory}
              />
            )}
            keyExtractor={(item) => item.category_id.toString()}
            style={styles.filterList}
          />

          <Text style={styles.sectionTitle}>Сортировка</Text>
          <SortOption
            label="Цена по возрастанию"
            option="priceAsc"
            selectedOption={sortOption}
            onSelect={onSortChange}
          />
          <SortOption
            label="Цена по убыванию"
            option="priceDesc"
            selectedOption={sortOption}
            onSelect={onSortChange}
          />
          <SortOption
            label="По названию (А-Я)"
            option="name"
            selectedOption={sortOption}
            onSelect={onSortChange}
          />

          <Button title="Применить" onPress={onClose} />
          <Button title="Сбросить" onPress={onReset} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: { fontSize: 18, marginBottom: 10, textAlign: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginVertical: 10 },
  filterList: { width: "100%", maxHeight: 200 },
});

export default FilterModal;
