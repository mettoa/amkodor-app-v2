import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import OrderItem from "./OrderItem";

const OrdersList = ({
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
      <View style={styles.emptyOrdersContainer}>
        <Text style={styles.emptyText}>У вас еще нет заказов</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      renderItem={({ item }) => (
        <OrderItem
          item={item}
          expandedOrder={expandedOrder}
          toggleOrderDetails={toggleOrderDetails}
          formatDate={formatDate}
          getStatusColor={getStatusColor}
          getOrderTotal={getOrderTotal}
          cancelOrder={cancelOrder}
        />
      )}
      keyExtractor={(item) => item.order_id.toString()}
      style={styles.orderList}
      scrollEnabled={false}
      nestedScrollEnabled={true}
    />
  );
};

const styles = StyleSheet.create({
  orderList: {
    marginBottom: 20,
  },
  emptyOrdersContainer: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
});

export default OrdersList;
