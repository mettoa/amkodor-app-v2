export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (e) {
    return "Дата неизвестна";
  }
};

export const translateOrderStatus = (status) => {
  const statusTranslations = {
    Pending: "Ожидает обработки",
    Processing: "В обработке",
    Processing: "В обработке",
    Shipped: "Отправлен",
    Delivered: "Доставлен",
    Cancelled: "Отменен",
  };

  return statusTranslations[status] || status;
};

export const getStatusColor = (status) => {
  switch (status) {
    case "Pending":
      return "#f0ad4e"; // желтый
    case "Processing":
      return "#5bc0de"; // голубой
    case "Shipped":
      return "#0275d8"; // синий
    case "Delivered":
      return "#5cb85c"; // зеленый
    case "Cancelled":
      return "#d9534f"; // красный
    default:
      return "#777777"; // серый
  }
};

export const getOrderTotal = (order) => {
  // Проверяем все возможные поля, где может быть сумма заказа
  const total = order.total_cost || order.total_price || order.total || 0;
  return `${total} руб.`;
};
