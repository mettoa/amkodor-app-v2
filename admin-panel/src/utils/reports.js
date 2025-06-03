import moment from "moment";

export const filterOrdersByDate = (orders, dateRange) => {
  console.log("filterOrdersByDate: версия функции 2025-04-25");
  if (!Array.isArray(orders)) {
    console.error("filterOrdersByDate: orders не является массивом", orders);
    return [];
  }

  if (!dateRange || !dateRange[0] || !dateRange[1]) {
    console.log(
      "filterOrdersByDate: диапазон дат не указан, возвращаем все заказы"
    );
    return orders;
  }

  console.log("filterOrdersByDate: исходный dateRange", {
    start: dateRange[0].format("YYYY-MM-DD HH:mm:ss Z"),
    end: dateRange[1].format("YYYY-MM-DD HH:mm:ss Z"),
  });

  const startDate = moment
    .utc(dateRange[0].format("YYYY-MM-DD"))
    .startOf("day");
  const endDate = moment.utc(dateRange[1].format("YYYY-MM-DD")).endOf("day");

  if (!startDate.isValid() || !endDate.isValid()) {
    console.warn(
      "filterOrdersByDate: диапазон дат невалиден, возвращаем пустой массив",
      dateRange
    );
    return [];
  }

  console.log("filterOrdersByDate: Обработанный диапазон дат (UTC)", {
    start: startDate.format("YYYY-MM-DD HH:mm:ss Z"),
    end: endDate.format("YYYY-MM-DD HH:mm:ss Z"),
  });

  const filtered = orders.filter((order, index) => {
    if (!order.created_at) {
      console.warn(
        `filterOrdersByDate: заказ ${index} не имеет created_at`,
        order
      );
      return false;
    }

    const orderDate = moment.utc(order.created_at);
    if (!orderDate.isValid()) {
      console.warn(
        `filterOrdersByDate: некорректный формат created_at в заказе ${index}`,
        {
          created_at: order.created_at,
          order,
        }
      );
      return false;
    }

    console.log(`filterOrdersByDate: проверка заказа ${index}`, {
      orderDate: orderDate.format("YYYY-MM-DD HH:mm:ss Z"),
      startDate: startDate.format("YYYY-MM-DD HH:mm:ss Z"),
      endDate: endDate.format("YYYY-MM-DD HH:mm:ss Z"),
      isInRange: orderDate.isBetween(startDate, endDate, undefined, "[]"),
    });

    const isInRange = orderDate.isBetween(startDate, endDate, undefined, "[]");
    return isInRange;
  });

  console.log("filterOrdersByDate: отфильтрованные заказы", filtered);
  return filtered;
};

// Фильтрация только доставленных заказов
export const getDeliveredOrders = (orders) => {
  if (!Array.isArray(orders)) return [];
  return orders.filter(
    (order) => order.status && order.status.toLowerCase() === "delivered"
  );
};

export const getProductOrders = (orders) => {
  if (!Array.isArray(orders)) return [];
  const productMap = {};
  orders.forEach((order) => {
    if (!order.items || !Array.isArray(order.items)) return;
    order.items.forEach((item) => {
      if (!item) return;
      const productname = item.productname || "Без названия";
      if (!productMap[productname]) {
        productMap[productname] = {
          productname,
          orderCount: 0,
          totalQuantity: 0,
          totalRevenue: 0,
        };
      }
      productMap[productname].orderCount += 1;
      productMap[productname].totalQuantity += Number(item.quantity) || 0;
      productMap[productname].totalRevenue +=
        (Number(item.quantity) || 0) * (parseFloat(item.price) || 0);
    });
  });
  return Object.values(productMap);
};

export const getTopProducts = (orders, limit = 10) => {
  if (!Array.isArray(orders)) return [];
  const productMap = {};
  orders.forEach((order) => {
    if (!order.items || !Array.isArray(order.items)) return;
    order.items.forEach((item) => {
      if (!item || !item.product_id) return;
      const key = item.product_id;
      if (!productMap[key]) {
        productMap[key] = {
          product_id: item.product_id,
          productname: item.productname || "Без названия",
          totalQuantity: 0,
          totalRevenue: 0,
          averagePrice: 0,
        };
      }
      const quantity = Number(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      productMap[key].totalQuantity += quantity;
      productMap[key].totalRevenue += quantity * price;
      productMap[key].averagePrice = price;
    });
  });
  return Object.values(productMap)
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, limit);
};

export const getCategoryStats = (orders) => {
  if (!Array.isArray(orders)) return [];
  const categoryMap = {};

  orders.forEach((order) => {
    if (!order.items || !Array.isArray(order.items)) return;
    order.items.forEach((item) => {
      if (!item) return;

      // Используем новое поле category_name из данных заказа
      const category = item.category_name || "Без категории";

      if (!categoryMap[category]) {
        categoryMap[category] = {
          category,
          totalOrders: 0,
          totalQuantity: 0,
          totalRevenue: 0,
          uniqueProducts: new Set(),
        };
      }
      categoryMap[category].totalOrders += 1;
      categoryMap[category].totalQuantity += Number(item.quantity) || 0;
      categoryMap[category].totalRevenue +=
        (Number(item.quantity) || 0) * (parseFloat(item.price) || 0);
      if (item.product_id) {
        categoryMap[category].uniqueProducts.add(item.product_id);
      }
    });
  });

  return Object.values(categoryMap)
    .map((cat) => ({
      ...cat,
      uniqueProducts: cat.uniqueProducts.size,
      averageOrderValue:
        cat.totalOrders > 0 ? cat.totalRevenue / cat.totalOrders : 0,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
};

// Статистика продаж (только доставленные заказы)
export const getSalesStats = (orders) => {
  const deliveredOrders = getDeliveredOrders(orders);
  const allOrders = orders || [];

  const salesRevenue = deliveredOrders.reduce(
    (sum, order) => sum + (parseFloat(order.total_cost) || 0),
    0
  );

  const totalRevenue = allOrders.reduce(
    (sum, order) => sum + (parseFloat(order.total_cost) || 0),
    0
  );

  return {
    totalOrders: allOrders.length,
    deliveredOrders: deliveredOrders.length,
    pendingOrders: allOrders.length - deliveredOrders.length,
    salesRevenue: salesRevenue,
    totalRevenue: totalRevenue,
    conversionRate:
      allOrders.length > 0
        ? (deliveredOrders.length / allOrders.length) * 100
        : 0,
    averageSaleValue:
      deliveredOrders.length > 0 ? salesRevenue / deliveredOrders.length : 0,
  };
};

// Статистика по статусам заказов
export const getOrderStatusStats = (orders) => {
  if (!Array.isArray(orders)) return [];
  const statusMap = {};

  orders.forEach((order) => {
    const status = order.status || "Не указан";
    if (!statusMap[status]) {
      statusMap[status] = {
        status,
        count: 0,
        totalRevenue: 0,
        percentage: 0,
      };
    }
    statusMap[status].count += 1;
    statusMap[status].totalRevenue += parseFloat(order.total_cost) || 0;
  });

  const totalOrders = orders.length;
  return Object.values(statusMap)
    .map((stat) => ({
      ...stat,
      percentage: totalOrders > 0 ? (stat.count / totalOrders) * 100 : 0,
      averageOrderValue: stat.count > 0 ? stat.totalRevenue / stat.count : 0,
    }))
    .sort((a, b) => b.count - a.count);
};

// Обновленная функция сводки с учетом продаж
export const getSummary = (orders, dateRange) => {
  if (!Array.isArray(orders))
    return {
      totalOrders: 0,
      deliveredOrders: 0,
      totalRevenue: "0.00",
      salesRevenue: "0.00",
      averageOrderValue: "0.00",
      averageSaleValue: "0.00",
      conversionRate: "0.00",
      uniqueProducts: 0,
      dateRange: "Все время",
    };

  const salesStats = getSalesStats(orders);
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (parseFloat(order.total_cost) || 0),
    0
  );
  const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
  const uniqueProducts = new Set(
    orders
      .flatMap((order) => (order.items || []).map((item) => item?.product_id))
      .filter(Boolean)
  ).size;

  return {
    totalOrders,
    deliveredOrders: salesStats.deliveredOrders,
    totalRevenue: totalRevenue.toFixed(2),
    salesRevenue: salesStats.salesRevenue.toFixed(2),
    averageOrderValue: averageOrderValue.toFixed(2),
    averageSaleValue: salesStats.averageSaleValue.toFixed(2),
    conversionRate: salesStats.conversionRate.toFixed(2),
    uniqueProducts,
    dateRange:
      dateRange && dateRange[0] && dateRange[1]
        ? // Форматируем даты в русском формате
          `${dateRange[0].format("DD.MM.YYYY")} - ${dateRange[1].format(
            "DD.MM.YYYY"
          )}`
        : "Все время",
  };
};

export const getTopProductsForSummary = (orders) => {
  const topProducts = getTopProducts(orders, 5);
  return topProducts.map((product) => ({
    productname: product.productname,
    totalQuantity: product.totalQuantity,
    totalRevenue: product.totalRevenue.toFixed(2),
  }));
};

// Временная статистика (по дням, неделям, месяцам)
export const getTimeSeriesStats = (orders, period = "day") => {
  if (!Array.isArray(orders)) return [];

  const timeMap = {};
  const deliveredOrders = getDeliveredOrders(orders);

  orders.forEach((order) => {
    if (!order.created_at) return;

    let timeKey;
    const orderDate = moment.utc(order.created_at);

    switch (period) {
      case "day":
        timeKey = orderDate.format("YYYY-MM-DD");
        break;
      case "week":
        timeKey = orderDate.startOf("week").format("YYYY-MM-DD");
        break;
      case "month":
        timeKey = orderDate.format("YYYY-MM");
        break;
      default:
        timeKey = orderDate.format("YYYY-MM-DD");
    }

    if (!timeMap[timeKey]) {
      timeMap[timeKey] = {
        period: timeKey,
        totalOrders: 0,
        deliveredOrders: 0,
        totalRevenue: 0,
        salesRevenue: 0,
      };
    }

    timeMap[timeKey].totalOrders += 1;
    timeMap[timeKey].totalRevenue += parseFloat(order.total_cost) || 0;

    if (order.status && order.status.toLowerCase() === "delivered") {
      timeMap[timeKey].deliveredOrders += 1;
      timeMap[timeKey].salesRevenue += parseFloat(order.total_cost) || 0;
    }
  });

  return Object.values(timeMap)
    .map((item) => {
      let displayPeriod = item.period;
      try {
        switch (period) {
          case "day":
            displayPeriod = moment.utc(item.period).format("DD.MM.YYYY");
            break;
          case "week":
            const start = moment.utc(item.period);
            const end = start.clone().endOf("week");
            displayPeriod = `${start.format("DD.MM.YYYY")} - ${end.format(
              "DD.MM.YYYY"
            )}`;
            break;
          case "month":
            displayPeriod = moment.utc(`${item.period}-01`).format("MM.YYYY");
            break;
          default:
            displayPeriod = moment.utc(item.period).format("DD.MM.YYYY");
        }
      } catch (e) {
        console.error("Ошибка форматирования даты:", e);
      }
      return { ...item, displayPeriod };
    })
    .sort((a, b) => a.period.localeCompare(b.period));
};
