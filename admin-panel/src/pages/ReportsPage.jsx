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
  Tabs,
  Select,
  Progress,
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
  getDeliveredOrders,
  getCategoryStats,
  getSalesStats,
  getOrderStatusStats,
  getTimeSeriesStats,
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
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
];

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
  const [timePeriod, setTimePeriod] = useState("day");

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
    const result = filterOrdersByDate(orders, dateRange);
    console.log("ReportsPage: отфильтрованные заказы", result);
    return result;
  }, [orders, dateRange]);

  const deliveredOrders = useMemo(() => {
    return getDeliveredOrders(filteredOrders);
  }, [filteredOrders]);

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

  const categoryStats = useMemo(() => {
    return getCategoryStats(filteredOrders);
  }, [filteredOrders]);

  const salesStats = useMemo(() => {
    return getSalesStats(filteredOrders);
  }, [filteredOrders]);

  const orderStatusStats = useMemo(() => {
    return getOrderStatusStats(filteredOrders);
  }, [filteredOrders]);

  const timeSeriesStats = useMemo(() => {
    return getTimeSeriesStats(filteredOrders, timePeriod);
  }, [filteredOrders, timePeriod]);

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

    // Используем русский формат для даты создания
    const creationDate = moment().format("DD.MM.YYYY HH:mm:ss");

    const topProductsSummary = getTopProductsForSummary(filteredOrders);
    const summaryData = [
      {
        Показатель: "Название отчета",
        Значение: "Отчет по заказам и продажам",
      },
      { Показатель: "Компания", Значение: companyName },
      { Показатель: "Дата создания", Значение: creationDate },
      { Показатель: "Период", Значение: summary.dateRange },
      { Показатель: "Общее количество заказов", Значение: summary.totalOrders },
      { Показатель: "Доставленные заказы", Значение: summary.deliveredOrders },
      { Показатель: "Общая выручка (руб)", Значение: summary.totalRevenue },
      { Показатель: "Выручка от продаж (руб)", Значение: summary.salesRevenue },
      {
        Показатель: "Средняя стоимость заказа (руб)",
        Значение: summary.averageOrderValue,
      },
      {
        Показатель: "Средняя стоимость продажи (руб)",
        Значение: summary.averageSaleValue,
      },
      { Показатель: "Конверсия (%)", Значение: summary.conversionRate },
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

    // Экспорт статистики по категориям
    const categoryWs = XLSX.utils.json_to_sheet(
      categoryStats.map((cat) => ({
        Категория: cat.category,
        "Количество заказов": cat.totalOrders,
        "Общее количество": cat.totalQuantity,
        "Общая выручка (руб)": cat.totalRevenue.toFixed(2),
        "Уникальных товаров": cat.uniqueProducts,
        "Средний чек (руб)": cat.averageOrderValue.toFixed(2),
      }))
    );
    XLSX.utils.book_append_sheet(wb, categoryWs, "Статистика по категориям");

    // Экспорт статистики по статусам
    const statusWs = XLSX.utils.json_to_sheet(
      orderStatusStats.map((stat) => ({
        Статус: stat.status,
        "Количество заказов": stat.count,
        "Процент (%)": stat.percentage.toFixed(2),
        "Общая выручка (руб)": stat.totalRevenue.toFixed(2),
        "Средний чек (руб)": stat.averageOrderValue.toFixed(2),
      }))
    );
    XLSX.utils.book_append_sheet(wb, statusWs, "Статистика по статусам");

    XLSX.writeFile(wb, `Отчеты_продажи_${timestamp}.xlsx`);
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

  const categoryColumns = [
    {
      title: "Категория",
      dataIndex: "category",
      key: "category",
      sorter: (a, b) => a.category.localeCompare(b.category),
    },
    {
      title: "Заказов",
      dataIndex: "totalOrders",
      key: "totalOrders",
      sorter: (a, b) => a.totalOrders - b.totalOrders,
    },
    {
      title: "Количество",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      sorter: (a, b) => a.totalQuantity - b.totalQuantity,
    },
    {
      title: "Выручка (руб)",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      sorter: (a, b) => a.totalRevenue - b.totalRevenue,
      render: (value) => value.toFixed(2),
    },
    {
      title: "Товаров",
      dataIndex: "uniqueProducts",
      key: "uniqueProducts",
      sorter: (a, b) => a.uniqueProducts - b.uniqueProducts,
    },
    {
      title: "Средний чек (руб)",
      dataIndex: "averageOrderValue",
      key: "averageOrderValue",
      sorter: (a, b) => a.averageOrderValue - b.averageOrderValue,
      render: (value) => value.toFixed(2),
    },
  ];

  const statusColumns = [
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Количество",
      dataIndex: "count",
      key: "count",
      sorter: (a, b) => a.count - b.count,
    },
    {
      title: "Процент",
      dataIndex: "percentage",
      key: "percentage",
      sorter: (a, b) => a.percentage - b.percentage,
      render: (value) => (
        <div>
          <Progress
            percent={value}
            size="small"
            format={(percent) => `${percent.toFixed(1)}%`}
          />
        </div>
      ),
    },
    {
      title: "Выручка (руб)",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      sorter: (a, b) => a.totalRevenue - b.totalRevenue,
      render: (value) => value.toFixed(2),
    },
    {
      title: "Средний чек (руб)",
      dataIndex: "averageOrderValue",
      key: "averageOrderValue",
      sorter: (a, b) => a.averageOrderValue - b.averageOrderValue,
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

  return (
    <ErrorBoundary>
      <div style={{ padding: "24px" }}>
        <Title level={2} style={{ marginBottom: "24px" }}>
          Отчеты по заказам и продажам
        </Title>

        {/* Основная статистика */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Всего заказов" value={summary.totalOrders} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Доставлено заказов"
                value={summary.deliveredOrders}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Конверсия"
                value={summary.conversionRate}
                suffix="%"
                valueStyle={{
                  color: summary.conversionRate > 50 ? "#3f8600" : "#cf1322",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Выручка от продаж (руб)"
                value={summary.salesRevenue}
                precision={2}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
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
                title="Средняя продажа (руб)"
                value={summary.averageSaleValue}
                precision={2}
                valueStyle={{ color: "#3f8600" }}
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

        {/* Фильтры */}
        <Space style={{ marginBottom: "24px" }} wrap>
          <Button onClick={setToday}>За сегодня</Button>
          <Button onClick={setLastWeek}>За последнюю неделю</Button>
          <Button onClick={setLastMonth}>За последний месяц</Button>
          <Button onClick={setAllTime}>За всё время</Button>
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              const newDateRange =
                dates && dates[0] && dates[1]
                  ? [dates[0].startOf("day"), dates[1].endOf("day")]
                  : null;
              setDateRange(newDateRange);
            }}
            format="DD.MM.YYYY"
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

        {/* Вкладки с разными видами отчетов */}
        <Tabs defaultActiveKey="1">
          <TabPane tab="Продажи и заказы" key="1">
            {/* График временной динамики */}
            <Card
              title="Динамика заказов и продаж"
              style={{ marginBottom: "24px" }}
            >
              <Space style={{ marginBottom: "16px" }}>
                <span>Период:</span>
                <Select
                  value={timePeriod}
                  onChange={setTimePeriod}
                  style={{ width: 120 }}
                >
                  <Option value="day">По дням</Option>
                  <Option value="week">По неделям</Option>
                  <Option value="month">По месяцам</Option>
                </Select>
              </Space>
              {timeSeriesStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={timeSeriesStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="displayPeriod" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      formatter={(value, name) => [
                        name.includes("Revenue")
                          ? `${parseFloat(value).toFixed(2)} руб`
                          : value,
                        name,
                      ]}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="totalOrders"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      name="Всего заказов"
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="deliveredOrders"
                      stackId="2"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      name="Доставлено"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="salesRevenue"
                      stroke="#ff7300"
                      name="Выручка от продаж"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p>Нет данных для отображения</p>
              )}
            </Card>

            {/* Статистика по статусам заказов */}
            <Card
              title="Статистика по статусам заказов"
              style={{ marginBottom: "24px" }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  {orderStatusStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={orderStatusStats}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          label={({ status, percentage }) =>
                            `${status}: ${percentage.toFixed(1)}%`
                          }
                        >
                          {orderStatusStats.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [
                            value,
                            "Количество заказов",
                          ]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p>Нет данных для отображения</p>
                  )}
                </Col>
                <Col xs={24} lg={12}>
                  <Table
                    columns={statusColumns}
                    dataSource={orderStatusStats}
                    rowKey="status"
                    loading={loading}
                    pagination={false}
                    size="small"
                  />
                </Col>
              </Row>
            </Card>
          </TabPane>

          <TabPane tab="Товары" key="2">
            {/* Анализ товаров */}
            <Card
              title="Количество заказов по товарам"
              style={{ marginBottom: "24px" }}
            >
              {productOrders.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={productOrders.slice(0, 10)}
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

            {/* Топ товаров */}
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
                columns={[
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
                    sorter: (a, b) =>
                      a.productname.localeCompare(b.productname),
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
                ]}
                dataSource={topProducts}
                rowKey="product_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                style={{ marginTop: 20 }}
              />
            </Card>
          </TabPane>

          <TabPane tab="Категории" key="3">
            {/* Статистика по категориям */}
            <Card title="Статистика по категориям товаров">
              <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                <Col xs={24} lg={12}>
                  {categoryStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={categoryStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="category"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis />
                        <Tooltip
                          formatter={(value, name) => [
                            name === "totalRevenue"
                              ? `${parseFloat(value).toFixed(2)} руб`
                              : value,
                            name === "totalRevenue"
                              ? "Выручка"
                              : name === "totalOrders"
                              ? "Заказов"
                              : name === "totalQuantity"
                              ? "Количество"
                              : name,
                          ]}
                        />
                        <Legend />
                        <Bar
                          dataKey="totalOrders"
                          fill="#8884d8"
                          name="Заказов"
                        />
                        <Bar
                          dataKey="totalQuantity"
                          fill="#82ca9d"
                          name="Количество"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p>Нет данных для отображения</p>
                  )}
                </Col>
                <Col xs={24} lg={12}>
                  {categoryStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryStats}
                          dataKey="totalRevenue"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          label={({ category, totalRevenue }) =>
                            `${category}: ${parseFloat(totalRevenue).toFixed(
                              0
                            )} руб`
                          }
                        >
                          {categoryStats.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [
                            `${parseFloat(value).toFixed(2)} руб`,
                            "Выручка",
                          ]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p>Нет данных для отображения</p>
                  )}
                </Col>
              </Row>
              <Table
                columns={categoryColumns}
                dataSource={categoryStats}
                rowKey="category"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </TabPane>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
};

export default ReportsPage;
