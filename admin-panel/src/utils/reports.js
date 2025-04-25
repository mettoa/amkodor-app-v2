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

export const getSummary = (orders, dateRange) => {
  if (!Array.isArray(orders))
    return {
      totalOrders: 0,
      totalRevenue: "0.00",
      averageOrderValue: "0.00",
      uniqueProducts: 0,
      dateRange: "Все время",
    };

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
    totalRevenue: totalRevenue.toFixed(2),
    averageOrderValue: averageOrderValue.toFixed(2),
    uniqueProducts,
    dateRange:
      dateRange && dateRange[0] && dateRange[1]
        ? `${dateRange[0].format("YYYY-MM-DD")} - ${dateRange[1].format(
            "YYYY-MM-DD"
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
