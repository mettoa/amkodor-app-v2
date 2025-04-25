import React, { useState, useEffect, useMemo, Component } from "react";
import {
  Table,
  Button,
  message,
  Space,
  Card,
  DatePicker,
  Statistic,
  Row,
  Col,
  Typography,
} from "antd";
import axios from "axios";
import * as XLSX from "xlsx";
import moment from "moment";
import { useAuth } from "../hooks/useAuth";
import {
  filterOrdersByDate,
  getProductOrders,
  getTopProducts,
  getSummary,
  getTopProductsForSummary,
} from "../utils/reports";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

class ErrorBoundary extends Component {
  state = { hasError: false, errorMessage: "" };

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "24px", textAlign: "center" }}>
          <Title level={3}>Произошла ошибка</Title>
          <p>{this.state.errorMessage}</p>
          <Button type="primary" onClick={() => window.location.reload()}>
            Перезагрузить страницу
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ReportsPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(null);

  useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/orders");
      console.log("Данные заказов (Reports):", response.data);
      const ordersData = response.data.data || [];
      if (!Array.isArray(ordersData)) {
        throw new Error("Данные заказов не являются массивом");
      }
      setOrders(ordersData);
      message.success("Данные загружены");
    } catch (error) {
      console.error("Ошибка при загрузке заказов:", error);
      const errorMessage =
        error.response?.data?.error || "Ошибка при загрузке данных";
      setError(errorMessage);
      message.error(errorMessage);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    console.log("ReportsPage: текущий dateRange", {
      start: dateRange?.[0]?.format("YYYY-MM-DD HH:mm:ss Z") || "не указано",
      end: dateRange?.[1]?.format("YYYY-MM-DD HH:mm:ss Z") || "не указано",
    });
    const result = filterOrdersByDate(orders, dateRange);
    console.log("ReportsPage: отфильтрованные заказы", result);
    return result;
  }, [orders, dateRange]);

  const productOrders = useMemo(() => {
    const result = getProductOrders(filteredOrders);
    console.log("Заказы по товарам:", result);
    return result;
  }, [filteredOrders]);

  const topProducts = useMemo(() => {
    const result = getTopProducts(filteredOrders);
    console.log("Топ товаров:", result);
    return result;
  }, [filteredOrders]);

  const summary = useMemo(
    () => getSummary(filteredOrders, dateRange),
    [filteredOrders, dateRange]
  );

  const setToday = () => {
    setDateRange([moment().startOf("day"), moment().endOf("day")]);
  };

  const setLastWeek = () => {
    setDateRange([
      moment().subtract(7, "days").startOf("day"),
      moment().endOf("day"),
    ]);
  };

  const setLastMonth = () => {
    setDateRange([
      moment().subtract(1, "month").startOf("day"),
      moment().endOf("day"),
    ]);
  };

  const setAllTime = () => {
    setDateRange(null);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const timestamp = moment().format("YYYY-MM-DD_HH-mm-ss");
    const companyName = "Amkodor App";

    const topProductsSummary = getTopProductsForSummary(filteredOrders);
    const summaryData = [
      { Показатель: "Название отчета", Значение: "Отчет по заказам" },
      { Показатель: "Компания", Значение: companyName },
      { Показатель: "Дата создания", Значение: timestamp },
      { Показатель: "Период", Значение: summary.dateRange },
      { Показатель: "Общее количество заказов", Значение: summary.totalOrders },
      { Показатель: "Общая выручка (руб)", Значение: summary.totalRevenue },
      {
        Показатель: "Средняя стоимость заказа (руб)",
        Значение: summary.averageOrderValue,
      },
      { Показатель: "Уникальных товаров", Значение: summary.uniqueProducts },
      {},
      { Показатель: "Топ-5 товаров по количеству" },
      ...topProductsSummary.map((item) => ({
        Показатель: item.productname,
        Значение: `Количество: ${item.totalQuantity}, Выручка: ${item.totalRevenue} руб`,
      })),
    ];
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    summaryWs["!cols"] = [{ wch: 40 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, "Сводка");

    const allOrdersData = filteredOrders.map((order) => ({
      "ID заказа": order.order_id || "Не указан",
      Дата: order.created_at
        ? moment.utc(order.created_at).format("YYYY-MM-DD HH:mm:ss")
        : "Не указана",
      Товары:
        order.items?.map((item) => item.productname).join(", ") ||
        "Нет товаров",
      "Количество товаров":
        order.items?.reduce(
          (sum, item) => sum + (Number(item.quantity) || 0),
          0
        ) || 0,
      "Сумма (руб)": parseFloat(order.total_cost || 0).toFixed(2),
    }));
    const allOrdersWs = XLSX.utils.json_to_sheet(allOrdersData);
    allOrdersWs["!cols"] = [
      { wch: 15 },
      { wch: 20 },
      { wch: 40 },
      { wch: 20 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(wb, allOrdersWs, "Все заказы");

    const productWs = XLSX.utils.json_to_sheet(
      productOrders.map((item) => ({
        Товар: item.productname,
        "Количество заказов": item.orderCount,
        "Общее количество": item.totalQuantity,
        "Общая выручка (руб)": item.totalRevenue.toFixed(2),
      }))
    );
    productWs["!cols"] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, productWs, "Заказы по товарам");

    const topProductsWs = XLSX.utils.json_to_sheet(
      topProducts.map((item) => ({
        "ID товара": item.product_id,
        Название: item.productname,
        "Общее количество": item.totalQuantity,
        "Общая выручка (руб)": item.totalRevenue.toFixed(2),
        "Средняя цена (руб)": item.averagePrice.toFixed(2),
      }))
    );
    topProductsWs["!cols"] = [
      { wch: 15 },
      { wch: 30 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, topProductsWs, "Топ товаров");

    XLSX.writeFile(wb, `Отчеты_${timestamp}.xlsx`);
  };

  const productColumns = [
    {
      title: "Товар",
      dataIndex: "productname",
      key: "productname",
      sorter: (a, b) => a.productname.localeCompare(b.productname),
    },
    {
      title: "Количество заказов",
      dataIndex: "orderCount",
      key: "orderCount",
      sorter: (a, b) => a.orderCount - b.orderCount,
    },
    {
      title: "Общее количество",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      sorter: (a, b) => a.totalQuantity - b.totalQuantity,
    },
    {
      title: "Общая выручка (руб)",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      sorter: (a, b) => a.totalRevenue - b.totalRevenue,
      render: (value) => value.toFixed(2),
    },
  ];

  const topProductsColumns = [
    {
      title: "ID товара",
      dataIndex: "product_id",
      key: "product_id",
      sorter: (a, b) => a.product_id - b.product_id,
    },
    {
      title: "Название",
      dataIndex: "productname",
      key: "productname",
      sorter: (a, b) => a.productname.localeCompare(b.productname),
    },
    {
      title: "Общее количество",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      sorter: (a, b) => a.totalQuantity - b.totalQuantity,
    },
    {
      title: "Общая выручка (руб)",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      sorter: (a, b) => a.totalRevenue - b.totalRevenue,
      render: (value) => value.toFixed(2),
    },
    {
      title: "Средняя цена (руб)",
      dataIndex: "averagePrice",
      key: "averagePrice",
      sorter: (a, b) => a.averagePrice - b.averagePrice,
      render: (value) => value.toFixed(2),
    },
  ];

  if (error) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Title level={3}>Ошибка загрузки данных</Title>
        <p>{error}</p>
        <Button type="primary" onClick={fetchOrders}>
          Попробовать снова
        </Button>
      </div>
    );
  }

  console.log("ReportsPage: final dateRange before render", {
    start: dateRange?.[0]?.format("YYYY-MM-DD HH:mm:ss Z") || "не указано",
    end: dateRange?.[1]?.format("YYYY-MM-DD HH:mm:ss Z") || "не указано",
  });

  return (
    <ErrorBoundary>
      <div style={{ padding: "24px" }}>
        <Title level={2} style={{ marginBottom: "24px" }}>
          Отчеты по заказам
        </Title>
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Общее количество заказов"
                value={summary.totalOrders}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Общая выручка (руб)"
                value={summary.totalRevenue}
                precision={2}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Средний чек (руб)"
                value={summary.averageOrderValue}
                precision={2}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Уникальных товаров"
                value={summary.uniqueProducts}
              />
            </Card>
          </Col>
        </Row>

        <Space style={{ marginBottom: "24px" }} wrap>
          <Button onClick={setToday}>За сегодня</Button>
          <Button onClick={setLastWeek}>За последнюю неделю</Button>
          <Button onClick={setLastMonth}>За последний месяц</Button>
          <Button onClick={setAllTime}>За всё время</Button>
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              console.log("RangePicker: выбранные даты", {
                rawDates: dates,
                start:
                  dates?.[0]?.format("YYYY-MM-DD HH:mm:ss Z") || "не указано",
                end:
                  dates?.[1]?.format("YYYY-MM-DD HH:mm:ss Z") || "не указано",
              });
              const newDateRange =
                dates && dates[0] && dates[1]
                  ? [dates[0].startOf("day"), dates[1].endOf("day")]
                  : null;
              console.log("RangePicker: установлен dateRange", {
                start:
                  newDateRange?.[0]?.format("YYYY-MM-DD HH:mm:ss Z") ||
                  "не указано",
                end:
                  newDateRange?.[1]?.format("YYYY-MM-DD HH:mm:ss Z") ||
                  "не указано",
              });
              setDateRange(newDateRange);
            }}
            format="YYYY-MM-DD"
            placeholder={["Начало периода", "Конец периода"]}
          />
          <Button onClick={fetchOrders} loading={loading}>
            Обновить
          </Button>
          <Button onClick={setAllTime}>Сбросить фильтры</Button>
          <Button onClick={exportToExcel} type="primary">
            Экспорт в Excel
          </Button>
        </Space>

        <Card
          title="Количество заказов по товарам"
          style={{ marginBottom: "24px" }}
        >
          {productOrders.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={productOrders}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="productname"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="totalQuantity"
                  fill="#8884d8"
                  name="Общее количество"
                />
                <Bar
                  dataKey="orderCount"
                  fill="#82ca9d"
                  name="Количество заказов"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>Нет данных для отображения</p>
          )}
          <Table
            columns={productColumns}
            dataSource={productOrders}
            rowKey="productname"
            loading={loading}
            pagination={{ pageSize: 10 }}
            style={{ marginTop: 20 }}
          />
        </Card>

        <Card title="Топ востребованных товаров">
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topProducts}
                  dataKey="totalQuantity"
                  nameKey="productname"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {topProducts.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p>Нет данных для отображения</p>
          )}
          <Table
            columns={topProductsColumns}
            dataSource={topProducts}
            rowKey="product_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            style={{ marginTop: 20 }}
          />
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default ReportsPage;
