import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const OrderItem = ({
  order,
  isExpanded,
  onToggle,
  formatDate,
  getStatusColor,
  getOrderTotal,
  onCancelOrder,
}) => {
  return (
    <View style={styles.orderCard}>
      <TouchableOpacity
        style={styles.orderHeader}
        onPress={() => onToggle(order.order_id)}
      >
        <View>
          <Text style={styles.orderTitle}>Заказ #{order.order_id}</Text>
          <Text style={styles.orderDate}>
            от {formatDate(order.created_at)}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <Text
            style={[styles.status, { color: getStatusColor(order.status) }]}
          >
            {order.status}
          </Text>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={24}
            color="#555"
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.orderDetails}>
          <Text style={styles.detailsTitle}>Товары:</Text>
          {order.items?.map((item) => (
            <View key={item.product_id} style={styles.orderItem}>
              <Text style={styles.itemName}>{item.productname}</Text>
              <Text style={styles.itemPrice}>
                {parseFloat(item.price).toFixed(2)} руб. x {item.quantity} ={" "}
                {(parseFloat(item.price) * item.quantity).toFixed(2)} руб.
              </Text>
            </View>
          ))}
          <Text style={styles.totalPrice}>
            Итого: {getOrderTotal(order)} руб.
          </Text>
          {order.status === "Pending" && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => onCancelOrder(order.order_id)}
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
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 3,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  status: {
    fontWeight: "bold",
    marginRight: 10,
  },
  orderDetails: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  detailsTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
  },
  orderItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
  },
  itemPrice: {
    fontSize: 14,
    color: "#666",
    marginTop: 3,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    alignSelf: "flex-end",
  },
  cancelButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: "flex-start",
    marginTop: 15,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default OrderItem;
