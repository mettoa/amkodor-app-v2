import React, { useContext } from "react";
import { Text, View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";
import { AuthContext } from "./src/contexts/AuthContext";
import { CartContext } from "./src/contexts/CartContext";

import LoginScreen from "./src/screens/LoginScreen";
import CatalogScreen from "./src/screens/CatalogScreen";
import SearchScreen from "./src/screens/SearchScreen";
import CartScreen from "./src/screens/CartScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import ProductDetailScreen from "./src/screens/ProductDetailScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Компонент для отображения badge с количеством товаров
const CartIconWithBadge = ({ color, size }) => {
  const { getCartItemsCount } = useContext(CartContext);
  const itemsCount = getCartItemsCount();

  return (
    <View style={styles.cartIconContainer}>
      <Icon name="cart" size={size} color={color} />
      {itemsCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {itemsCount > 99 ? "99+" : itemsCount}
          </Text>
        </View>
      )}
    </View>
  );
};

const GuestTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerTitleAlign: "center",
      tabBarIcon: ({ color, size }) => {
        let iconName;

        switch (route.name) {
          case "Catalog":
            iconName = "home";
            break;
          case "Cart":
            return <CartIconWithBadge color={color} size={size} />;
          case "Profile":
            iconName = "person";
            break;
          default:
            iconName = "ellipse";
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#007bff",
      tabBarInactiveTintColor: "#6c757d",
      tabBarStyle: {
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#e9ecef",
        paddingTop: 5,
        paddingBottom: 5,
        height: 60,
      },
    })}
  >
    <Tab.Screen
      name="Catalog"
      component={CatalogScreen}
      options={{ title: "Каталог" }}
    />
    <Tab.Screen
      name="Cart"
      component={CartScreen}
      options={{ title: "Корзина" }}
    />
    <Tab.Screen
      name="Profile"
      component={LoginScreen}
      options={{ title: "Войти" }}
    />
  </Tab.Navigator>
);

const AuthenticatedTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerTitleAlign: "center",
      tabBarIcon: ({ color, size }) => {
        let iconName;

        switch (route.name) {
          case "Catalog":
            iconName = "home";
            break;
          case "Cart":
            return <CartIconWithBadge color={color} size={size} />;
          case "Profile":
            iconName = "person";
            break;
          default:
            iconName = "ellipse";
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#007bff",
      tabBarInactiveTintColor: "#6c757d",
      tabBarStyle: {
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#e9ecef",
        paddingTop: 5,
        paddingBottom: 5,
        height: 60,
      },
    })}
  >
    <Tab.Screen
      name="Catalog"
      component={CatalogScreen}
      options={{ title: "Каталог" }}
    />
    <Tab.Screen
      name="Cart"
      component={CartScreen}
      options={{ title: "Корзина" }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: "Профиль" }}
    />
  </Tab.Navigator>
);

const MainStack = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#fff",
          elevation: 1,
          shadowOpacity: 0.1,
        },
        headerTintColor: "#333",
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen
        name="Tabs"
        component={isAuthenticated ? AuthenticatedTabs : GuestTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          title: "Товар",
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: "Вход",
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: "Поиск",
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};

const Navigation = () => {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <MainStack />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  cartIconContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    right: -8,
    top: -8,
    backgroundColor: "#dc3545",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    fontSize: 16,
    color: "#6c757d",
  },
});

export default Navigation;
