import React, { useContext } from "react";
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

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === "Catalog") iconName = "home";
        else if (route.name === "Search") iconName = "search";
        else if (route.name === "Cart") iconName = "cart";
        else if (route.name === "Profile") iconName = "person";
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "blue",
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
      options={{ title: "Поиск" }}
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

const Navigation = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default Navigation;
