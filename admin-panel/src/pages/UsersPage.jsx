// src/pages/UsersPage.jsx
import React, { useState, useEffect } from "react";
import { Table, Button, message, Space } from "antd";
import axios from "axios";
import SearchPanel from "../components/SearchPanel";
import { useAuth } from "../hooks/useAuth";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/users");
      setUsers(response.data);
      setFilteredUsers(response.data);
      message.success("Пользователи успешно загружены");
    } catch (error) {
      message.error("Ошибка при загрузке пользователей");
      console.error("Ошибка:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (id === user?.user_id) {
      message.error("Нельзя удалить текущего пользователя");
      return;
    }

    try {
      const response = await axios.delete(`/users/${id}`);
      const updatedUsers = users.filter((user) => user.user_id !== id);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      message.success(response.data.message || "Пользователь успешно удален");
    } catch (error) {
      if (error.response?.status === 404) {
        const updatedUsers = users.filter((user) => user.user_id !== id);
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        message.success("Пользователь уже удален или не найден");
      } else {
        message.error("Ошибка при удалении пользователя");
        console.error("Ошибка:", error);
      }
    }
  };

  const handleSearch = (value) => {
    const lowercasedValue = value.toLowerCase();
    if (!value) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) =>
        user.username.toLowerCase().includes(lowercasedValue)
      );
      setFilteredUsers(filtered);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "user_id",
      key: "user_id",
    },
    {
      title: "Имя",
      dataIndex: "username",
      key: "username",
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Роль",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Действия",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            danger
            onClick={() => handleDelete(record.user_id)}
            disabled={record.user_id === user?.user_id}
          >
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
          placeholder="Поиск по имени пользователя"
        />
        <Button onClick={fetchUsers}>Обновить</Button>
      </Space>
      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="user_id"
        loading={loading}
      />
    </div>
  );
};

export default UsersPage;
