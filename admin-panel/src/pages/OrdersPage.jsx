// src/pages/OrdersPage.jsx
import React, { useState, useEffect } from "react";
import { Table, Button, message, Space, Select, Modal } from "antd";
import axios from "axios";
import SearchPanel from "../components/SearchPanel";
import { useAuth } from "../hooks/useAuth";

const { Option } = Select;

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/orders");
      console.log("Данные заказов:", response.data);
      const ordersData = response.data.data || [];
      if (!Array.isArray(ordersData)) {
        console.error("ordersData не является массивом:", ordersData);
        message.error("Некорректный формат данных заказов");
        setOrders([]);
        setFilteredOrders([]);
      } else {
        setOrders(ordersData);
        setFilteredOrders(ordersData);
        message.success("Заказы успешно загружены");
      }
    } catch (error) {
      console.error("Ошибка при загрузке заказов:", error);
      message.error(
        error.response?.data?.error || "Ошибка при загрузке заказов"
      );
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      const response = await axios.put(`/orders/${orderId}/status`, { status });
      const updatedOrders = orders.map((order) =>
        order.order_id === orderId ? { ...order, status } : order
      );
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
      message.success(response.data.message || "Статус заказа обновлен");
    } catch (error) {
      message.error(
        error.response?.data?.error || "Ошибка при обновлении статуса заказа"
      );
      console.error("Ошибка:", error);
    }
  };

  const handleViewDetails = (order) => {
    console.log("Выбранный заказ:", order);
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };

  const handleSearch = (value) => {
    const lowercasedValue = value.toLowerCase();
    if (!value) {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(
        (order) =>
          (order.username || "").toLowerCase().includes(lowercasedValue) ||
          order.order_id.toString().includes(lowercasedValue)
      );
      setFilteredOrders(filtered);
    }
  };

  console.log("filteredOrders:", filteredOrders);
  console.log("user:", user);

  const columns = [
    {
      title: "ID заказа",
      dataIndex: "order_id",
      key: "order_id",
      sorter: (a, b) => a.order_id - b.order_id,
    },
    {
      title: "Пользователь",
      dataIndex: "username",
      key: "username",
      sorter: (a, b) => (a.username || "").localeCompare(b.username || ""),
    },
    {
      title: "Общая сумма (руб)",
      dataIndex: "total_cost",
      key: "total_cost",
      sorter: (a, b) => parseFloat(a.total_cost) - parseFloat(b.total_cost),
      render: (value) => parseFloat(value).toFixed(2),
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 150 }}
          onChange={(value) => handleStatusChange(record.order_id, value)}
        >
          <Option value="Pending">Pending</Option>
          <Option value="Shipped">Shipped</Option>
          <Option value="Delivered">Delivered</Option>
          <Option value="Cancelled">Cancelled</Option>
        </Select>
      ),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button onClick={() => handleViewDetails(record)}>Подробности</Button>
        </Space>
      ),
    },
  ];

  const detailColumns = [
    {
      title: "Название товара",
      dataIndex: "productname",
      key: "productname",
    },
    {
      title: "Количество",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Цена (руб)",
      dataIndex: "price",
      key: "price",
      render: (value) => parseFloat(value).toFixed(2),
    },
    {
      title: "Общая стоимость (руб)",
      key: "total",
      render: (_, record) =>
        (record.quantity * parseFloat(record.price)).toFixed(2),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <SearchPanel
          onSearch={handleSearch}
          placeholder="Поиск по ID заказа или имени пользователя"
        />
        <Button onClick={fetchOrders}>Обновить</Button>
      </Space>
      <Table
        columns={columns}
        dataSource={filteredOrders}
        rowKey="order_id"
        loading={loading}
      />
      <Modal
        title={`Детали заказа #${selectedOrder?.order_id}`}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Закрыть
          </Button>,
        ]}
        width={800}
      >
        {selectedOrder && (
          <div>
            <p>
              <strong>ID заказа:</strong> {selectedOrder.order_id}
            </p>
            <p>
              <strong>Пользователь:</strong> {selectedOrder.username}
            </p>
            <p>
              <strong>Общая сумма:</strong>{" "}
              {parseFloat(selectedOrder.total_cost).toFixed(2)} руб
            </p>
            <p>
              <strong>Статус:</strong> {selectedOrder.status}
            </p>
            <p>
              <strong>Дата создания:</strong>{" "}
              {new Date(selectedOrder.created_at).toLocaleString()}
            </p>
            <h3>Товары в заказе</h3>
            <Table
              columns={detailColumns}
              dataSource={selectedOrder.items || []}
              rowKey="product_id"
              pagination={false}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdersPage;
