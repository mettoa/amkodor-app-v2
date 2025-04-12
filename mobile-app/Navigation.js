import React, { useContext } from "react";
import { Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";
import { AuthContext } from "./src/contexts/AuthContext";

import LoginScreen from "./src/screens/LoginScreen";
import CatalogScreen from "./src/screens/CatalogScreen";
import SearchScreen from "./src/screens/SearchScreen";
import CartScreen from "./src/screens/CartScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import ProductDetailScreen from "./src/screens/ProductDetailScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerTitleAlign: "center",
      tabBarIcon: ({ color, size }) => {
        let iconName;

        switch (route.name) {
          case "Catalog":
            iconName = "home";
            break;
          case "Search":
            iconName = "podium";
            break;
          case "Cart":
            iconName = "cart";
            break;
          case "Profile":
            iconName = "person";
            break;
          default:
            iconName = "ellipse";
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "black",
      tabBarInactiveTintColor: "gray",
    })}
  >
    <Tab.Screen
      name="Catalog"
      component={CatalogScreen}
      options={{ title: "Каталог" }}
    />
    <Tab.Screen
      name="Search"
      component={SearchScreen}
      options={{ title: "Сравнить" }}
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

const AuthStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ title: "Вход" }}
    />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Tabs"
      component={AppTabs}
      options={{ headerShown: false, title: "Каталог" }}
    />
    <Stack.Screen
      name="ProductDetail"
      component={ProductDetailScreen}
      options={{ title: "Товар" }}
    />
  </Stack.Navigator>
);

const Navigation = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <Text>Загрузка...</Text>;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default Navigation;
