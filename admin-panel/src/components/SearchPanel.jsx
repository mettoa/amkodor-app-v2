import React, { useState } from "react";
import { Input } from "antd";

const { Search } = Input;

const SearchPanel = ({ onSearch, placeholder = "Поиск..." }) => {
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (value) => {
    setSearchValue(value);
    onSearch(value.trim());
  };

  return (
    <Search
      placeholder={placeholder}
      value={searchValue}
      onChange={(e) => handleSearch(e.target.value)}
      onSearch={handleSearch}
      allowClear
      style={{ width: "300px", marginBottom: 16 }}
    />
  );
};

export default SearchPanel;
