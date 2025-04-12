import React from "react";
import Navigation from "./Navigation";
import { AuthProvider } from "./src/contexts/AuthContext";
import { CartProvider } from "./src/contexts/CartContext";
import { OrderProvider } from "./src/contexts/OrderContext";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <Navigation />
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  );
}
