import { useState, useEffect } from "react";
import { Layout as AntLayout, Menu, Button, Drawer, Avatar } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  FileOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const { Header, Sider, Content } = AntLayout;

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKeys = [location.pathname];

  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Дашборд",
      onClick: () => {
        navigate("/dashboard");
        if (mobileView) setDrawerVisible(false);
      },
    },
    {
      key: "/users",
      icon: <UserOutlined />,
      label: "Пользователи",
      onClick: () => {
        navigate("/users");
        if (mobileView) setDrawerVisible(false);
      },
    },
    {
      key: "/products",
      icon: <ShoppingOutlined />,
      label: "Товары",
      onClick: () => {
        navigate("/products");
        if (mobileView) setDrawerVisible(false);
      },
    },
    {
      key: "/orders",
      icon: <ShoppingCartOutlined />,
      label: "Заказы",
      onClick: () => {
        navigate("/orders");
        if (mobileView) setDrawerVisible(false);
      },
    },
    {
      key: "/reports",
      icon: <FileOutlined />,
      label: "Отчеты",
      onClick: () => {
        navigate("/reports");
        if (mobileView) setDrawerVisible(false);
      },
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebarContent = (
    <>
      <div className="logo">Админ-панель</div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        items={menuItems}
      />
    </>
  );

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      {mobileView ? (
        <Drawer
          placement="left"
          closable={true}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          bodyStyle={{ padding: 0, background: "#001529" }}
          width={200}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          breakpoint="lg"
        >
          {sidebarContent}
        </Sider>
      )}
      <AntLayout>
        <Header
          style={{
            background: "#fff",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0,21,41,.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {mobileView && (
              <Button
                type="text"
                icon={
                  drawerVisible ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
                }
                onClick={() => setDrawerVisible(!drawerVisible)}
                style={{ fontSize: "16px", marginRight: "12px" }}
              />
            )}
            {!mobileView && (
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: "16px" }}
              />
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ marginRight: "12px" }}>
              {user?.username || "Администратор"}
            </span>
            <Avatar icon={<UserOutlined />} />
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ marginLeft: "12px" }}
            />
          </div>
        </Header>
        <Content style={{ margin: "16px" }}>
          <div style={{ padding: "24px", background: "#fff", minHeight: 360 }}>
            <Outlet />
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
