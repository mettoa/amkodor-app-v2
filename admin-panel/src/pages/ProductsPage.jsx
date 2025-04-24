import React, { useState, useEffect } from "react";
import { Table, Button, message, Space } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SearchPanel from "../components/SearchPanel";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/products");
      setProducts(response.data);
      setFilteredProducts(response.data); // Изначально показываем все товары
      message.success("Товары успешно загружены");
    } catch (error) {
      message.error("Ошибка при загрузке товаров");
      console.error("Ошибка:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/products/${id}`);
      const updatedProducts = products.filter(
        (product) => product.product_id !== id
      );
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts); // Обновляем отфильтрованный список
      message.success("Товар успешно удален");
    } catch (error) {
      message.error("Ошибка при удалении товара");
      console.error("Ошибка:", error);
    }
  };

  const handleSearch = (value) => {
    const lowercasedValue = value.toLowerCase();
    if (!value) {
      setFilteredProducts(products); // Если запрос пустой, показываем все товары
    } else {
      const filtered = products.filter((product) =>
        product.productname.toLowerCase().includes(lowercasedValue)
      );
      setFilteredProducts(filtered);
    }
  };

  const columns = [
    {
      title: "Название",
      dataIndex: "productname",
      key: "productname",
      sorter: (a, b) => a.productname.localeCompare(b.productname),
    },
    {
      title: "Описание",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Цена (руб)",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Категория",
      dataIndex: "category_name",
      key: "category_name",
    },
    {
      title: "Изображение",
      dataIndex: "image_url",
      key: "image_url",
      render: (url) =>
        url ? (
          <img
            src={`http://localhost:3000${url}`}
            alt="product"
            style={{ width: "50px" }}
          />
        ) : (
          "Нет изображения"
        ),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            onClick={() => navigate(`/products/edit/${record.product_id}`)}
          >
            Редактировать
          </Button>
          <Button danger onClick={() => handleDelete(record.product_id)}>
            Удалить
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <SearchPanel
          onSearch={handleSearch}
          placeholder="Поиск по названию товара"
        />
        <Button type="primary" onClick={() => navigate("/products/add")}>
          Добавить товар
        </Button>
        <Button onClick={fetchProducts}>Обновить</Button>
      </Space>
      <Table
        columns={columns}
        dataSource={filteredProducts}
        rowKey="product_id"
        loading={loading}
      />
    </div>
  );
};

export default ProductsPage;
