const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const userRoutes = require("./routes/UserRoutes");
const authRoutes = require("./routes/AuthRoutes");
const productRoutes = require("./routes/ProductRoute");

//middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/products", productRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
