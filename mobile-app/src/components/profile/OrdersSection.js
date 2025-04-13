import React from "react";
import { View, Text, StyleSheet } from "react-native";
import OrderItem from "./OrderItem";

const OrdersSection = ({
  orders,
  expandedOrder,
  toggleOrderDetails,
  formatDate,
  getStatusColor,
  getOrderTotal,
  cancelOrder,
}) => {
  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>У вас пока нет заказов</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>Ваши заказы</Text>
      {orders.map((order) => (
        <OrderItem
          key={order.order_id}
          order={order}
          isExpanded={expandedOrder === order.order_id}
          onToggle={toggleOrderDetails}
          formatDate={formatDate}
          getStatusColor={getStatusColor}
          getOrderTotal={getOrderTotal}
          onCancelOrder={cancelOrder}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    marginTop: 10,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default OrdersSection;
