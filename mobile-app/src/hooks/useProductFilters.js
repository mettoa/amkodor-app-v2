import { useState, useCallback, useMemo } from "react";

const useProductFilters = (products) => {
  const [filters, setFilters] = useState({
    searchQuery: "",
    selectedCategories: new Set(),
    sortOption: null,
  });

  const toggleCategory = useCallback((categoryId) => {
    setFilters((prevFilters) => {
      const updatedCategories = new Set(prevFilters.selectedCategories);
      if (updatedCategories.has(categoryId)) {
        updatedCategories.delete(categoryId);
      } else {
        updatedCategories.add(categoryId);
      }
      return { ...prevFilters, selectedCategories: updatedCategories };
    });
  }, []);

  const handleSortChange = useCallback((option) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      sortOption: option,
    }));
  }, []);

  const handleSearchChange = useCallback((text) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      searchQuery: text,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      searchQuery: "",
      selectedCategories: new Set(),
      sortOption: null,
    });
  }, []);

  const filterAndSortProducts = useCallback(() => {
    const { searchQuery, selectedCategories, sortOption } = filters;

    let result = [...products];

    if (searchQuery) {
      result = result.filter((item) =>
        item.productname.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategories.size > 0) {
      result = result.filter((item) =>
        selectedCategories.has(item.category_id)
      );
    }

    if (sortOption === "priceAsc") {
      result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortOption === "priceDesc") {
      result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortOption === "name") {
      result.sort((a, b) => a.productname.localeCompare(b.productname));
    }

    return result;
  }, [products, filters]);

  const filteredProducts = useMemo(
    () => filterAndSortProducts(),
    [filterAndSortProducts]
  );

  return {
    filters,
    filteredProducts,
    toggleCategory,
    handleSortChange,
    handleSearchChange,
    resetFilters,
  };
};

export default useProductFilters;
