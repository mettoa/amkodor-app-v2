// src/pages/EditProductPage.jsx
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
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const { Option } = Select;

const EditProductPage = () => {
  const [form] = Form.useForm();
  const [file, setFile] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/products/${id}`);
      const productData = response.data;
      form.setFieldsValue(productData);
      setCurrentImageUrl(productData.image_url);
    } catch (error) {
      message.error("Ошибка при загрузке данных товара");
      console.error("Ошибка:", error);
    } finally {
      setLoading(false);
    }
  };

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
    } else {
      formData.append("image_url", currentImageUrl || "");
    }

    try {
      await axios.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Товар успешно обновлен");
      navigate("/products");
    } catch (error) {
      message.error("Ошибка при обновлении товара");
      console.error("Ошибка:", error);
    }
  };

  const handleUpload = ({ file }) => {
    setFile(file);
    return false;
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      style={{ maxWidth: "600px" }}
      disabled={loading}
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
      <Form.Item label="Текущее изображение">
        {currentImageUrl ? (
          <img
            src={`http://localhost:3000${currentImageUrl}`}
            alt="product"
            style={{ width: "100px", marginBottom: "10px" }}
          />
        ) : (
          <span>Нет изображения</span>
        )}
      </Form.Item>
      <Form.Item label="Новое изображение">
        <Upload beforeUpload={() => false} onChange={handleUpload} maxCount={1}>
          <Button icon={<UploadOutlined />}>Загрузить новое изображение</Button>
        </Upload>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Обновить товар
        </Button>
        <Button style={{ marginLeft: 8 }} onClick={() => navigate("/products")}>
          Отмена
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EditProductPage;
