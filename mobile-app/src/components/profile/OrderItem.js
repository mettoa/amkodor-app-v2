import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const OrderItem = ({
  item,
  expandedOrder,
  toggleOrderDetails,
  formatDate,
  getStatusColor,
  getOrderTotal,
  cancelOrder,
}) => {
  const isExpanded = expandedOrder === item.order_id;

  return (
    <View style={styles.orderCard}>
      <TouchableOpacity
        style={styles.orderHeader}
        onPress={() => toggleOrderDetails(item.order_id)}
      >
        <View style={styles.orderHeaderContent}>
          <Text style={styles.orderId}>Заказ #{item.order_id}</Text>
          <Text style={styles.orderDate}>
            {item.created_at ? formatDate(item.created_at) : "Недавно"}
          </Text>
        </View>
        <View style={styles.orderHeaderInfo}>
          <Text
            style={[styles.orderStatus, { color: getStatusColor(item.status) }]}
          >
            {item.status || "В обработке"}
          </Text>
          <Text style={styles.orderTotal}>{getOrderTotal(item)}</Text>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.orderDetails}>
          <Text style={styles.detailsTitle}>Информация о заказе:</Text>

          {item.items && item.items.length > 0 ? (
            <>
              <Text style={styles.itemsTitle}>Товары:</Text>
              {item.items.map((product, idx) => (
                <View key={idx} style={styles.itemContainer}>
                  <Text style={styles.itemName}>
                    •{" "}
                    {product.productname || product.name || `Товар ${idx + 1}`}
                  </Text>
                  <Text style={styles.itemDetails}>
                    ID: {product.product_id}, Количество: {product.quantity}
                  </Text>
                  <Text style={styles.itemPrice}>
                    Цена: {product.price} руб.
                  </Text>
                </View>
              ))}
              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>
                  Общая сумма: {getOrderTotal(item)}
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.noItemsText}>
              Информация о товарах недоступна
            </Text>
          )}

          <Text style={styles.addressTitle}>Адрес доставки:</Text>
          <Text style={styles.addressText}>
            {item.shipping_address || "Адрес не указан"}
          </Text>

          {item.status !== "Cancelled" && item.status !== "Delivered" && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => cancelOrder(item.order_id)}
            >
              <Text style={styles.cancelButtonText}>Отменить заказ</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  orderCard: {
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: "hidden",
  },
  orderHeader: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  orderHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderHeaderInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
  },
  orderStatus: {
    fontSize: 15,
    fontWeight: "500",
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  orderDetails: {
    padding: 15,
    backgroundColor: "#fff",
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  itemsTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 10,
    color: "#555",
  },
  itemContainer: {
    paddingLeft: 10,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 15,
    color: "#333",
  },
  itemDetails: {
    fontSize: 14,
    color: "#666",
    marginLeft: 15,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginLeft: 15,
  },
  totalContainer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
    marginTop: 10,
    alignItems: "flex-end",
  },
  totalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  noItemsText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 10,
  },
  addressTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
    color: "#555",
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: "#dc3545",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 15,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default OrderItem;
