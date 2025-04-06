const Product = require("../models/Product");
const upload = require("../config/multer");

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.uploadProductImage = upload.single("image");
exports.createProduct = async (req, res) => {
  const { productname, description, price, category_id } = req.body;
  const image_url = req.file ? `/images/products/${req.file.filename}` : null;

  try {
    const product = await Product.create({
      productname,
      description,
      price,
      category_id,
      image_url,
    });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductByID = async (req, res) => {
  try {
    const product = await Product.findByID(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ error: `product with id: ${req.params.id} not found` });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { productname, description, price, category_id, image_url } = req.body;
  const id = req.params.id;
  try {
    const product = await Product.update(
      id,
      productname,
      description,
      price,
      category_id,
      image_url
    );
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.findByCategory(req.params.id);
    if (!products) {
      return res.status(404).json({ error: "theres no such category" });
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.filterProducts = async (req, res) => {
  try {
    const { category_id, min_price, max_price } = req.query;

    if (min_price && isNaN(min_price))
      return res.status(400).json({ error: "Invalid min_price" });
    if (max_price && isNaN(max_price))
      return res.status(400).json({ error: "Invalid max_price" });

    const products = await Product.filter({
      category_id: category_id || null,
      min_price: parseFloat(min_price),
      max_price: parseFloat(max_price),
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.delete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
