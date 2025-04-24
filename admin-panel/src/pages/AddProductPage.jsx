// src/pages/AddProductPage.jsx
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  InputNumber,
  Upload,
  message,
  Select,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Option } = Select;

const AddProductPage = () => {
  const [form] = Form.useForm();
  const [file, setFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await axios.get("/categories");
      setCategories(response.data);
    } catch (error) {
      message.error("Ошибка при загрузке категорий");
      console.error("Ошибка:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const onFinish = async (values) => {
    const formData = new FormData();
    formData.append("productname", values.productname);
    formData.append("description", values.description || "");
    formData.append("price", values.price);
    formData.append("category_id", values.category_id);
    if (file) {
      formData.append("image", file);
    }

    try {
      await axios.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Товар успешно добавлен");
      navigate("/products");
    } catch (error) {
      message.error("Ошибка при добавлении товара");
      console.error("Ошибка:", error);
    }
  };

  const handleUpload = ({ file }) => {
    setFile(file);
    return false; // Предотвращаем автоматическую загрузку
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      style={{ maxWidth: "600px" }}
    >
      <Form.Item
        name="productname"
        label="Название"
        rules={[{ required: true, message: "Введите название товара" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Описание">
        <Input.TextArea />
      </Form.Item>
      <Form.Item
        name="price"
        label="Цена (руб)"
        rules={[{ required: true, message: "Введите цену" }]}
      >
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        name="category_id"
        label="Категория"
        rules={[{ required: true, message: "Выберите категорию" }]}
      >
        <Select
          placeholder="Выберите категорию"
          loading={loadingCategories}
          disabled={loadingCategories}
        >
          {categories.map((category) => (
            <Option key={category.category_id} value={category.category_id}>
              {category.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="Изображение">
        <Upload beforeUpload={() => false} onChange={handleUpload} maxCount={1}>
          <Button icon={<UploadOutlined />}>Загрузить изображение</Button>
        </Upload>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Добавить товар
        </Button>
        <Button style={{ marginLeft: 8 }} onClick={() => navigate("/products")}>
          Отмена
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddProductPage;
