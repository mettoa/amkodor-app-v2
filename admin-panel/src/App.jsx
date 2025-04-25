// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, Spin } from "antd";
import ruRU from "antd/lib/locale/ru_RU";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import { useAuth } from "./hooks/useAuth";
import ProductsPage from "./pages/ProductsPage";
import AddProductPage from "./pages/AddProductPage";
import EditProductPage from "./pages/EditProductPage";
import UsersPage from "./pages/UsersPage";
import OrdersPage from "./pages/OrdersPage";
import ReportsPage from "./pages/ReportsPage";

const NotFoundPage = () => <div>404 Not Found</div>;

function App() {
  const { initialized } = useAuth();

  if (!initialized) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      ></div>
    );
  }

  return (
    <ConfigProvider locale={ruRU}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/add" element={<AddProductPage />} />
            <Route path="/products/edit/:id" element={<EditProductPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/orders" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ConfigProvider>
  );
}

export default App;
