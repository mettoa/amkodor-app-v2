// src/pages/UsersPage.jsx
import React, { useState, useEffect } from "react";
import { Table, Button, message, Space, Tag } from "antd";
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

  const handleBlock = async (id) => {
    if (id === user?.user_id) {
      message.error("Нельзя заблокировать текущего пользователя");
      return;
    }

    try {
      const response = await axios.patch(`/users/${id}/block`);
      const updatedUsers = users.map((user) =>
        user.user_id === id ? { ...user, is_blocked: true } : user
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      message.success(
        response.data.message || "Пользователь успешно заблокирован"
      );
    } catch (error) {
      message.error("Ошибка при блокировке пользователя");
      console.error("Ошибка:", error);
    }
  };

  const handleUnblock = async (id) => {
    try {
      const response = await axios.patch(`/users/${id}/unblock`);
      const updatedUsers = users.map((user) =>
        user.user_id === id ? { ...user, is_blocked: false } : user
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      message.success(
        response.data.message || "Пользователь успешно разблокирован"
      );
    } catch (error) {
      message.error("Ошибка при разблокировке пользователя");
      console.error("Ошибка:", error);
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
      title: "Статус",
      key: "status",
      render: (_, record) => (
        <Tag color={record.is_blocked ? "red" : "green"}>
          {record.is_blocked ? "Заблокирован" : "Активен"}
        </Tag>
      ),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_, record) => (
        <Space>
          {record.is_blocked ? (
            <Button
              type="primary"
              onClick={() => handleUnblock(record.user_id)}
              disabled={record.user_id === user?.user_id}
            >
              Разблокировать
            </Button>
          ) : (
            <Button
              danger
              onClick={() => handleBlock(record.user_id)}
              disabled={record.user_id === user?.user_id}
            >
              Заблокировать
            </Button>
          )}
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
