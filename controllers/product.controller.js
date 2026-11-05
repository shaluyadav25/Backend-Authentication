import Product from "../models/product.model.js";

export async function createProduct(req, res) {
  const { name, description, price } = req.body ?? {};
  const product = await Product.create({
    name,
    description,
    price,
    user: req.userId,
  });

  return res.status(201).json(product);
}

export async function getProducts(req, res) {
  const products = await Product.find({ user: req.userId }).sort({
    createdAt: -1,
  });
  return res.json(products);
}

export async function getProduct(req, res) {
  const product = await Product.findOne({
    _id: req.params.id,
    user: req.userId,
  });
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json(product);
}

export async function updateProduct(req, res) {
  const { name, description, price } = req.body ?? {};
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (price !== undefined) updates.price = price;

  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { $set: updates },
    { new: true, runValidators: true },
  );
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json(product);
}

export async function deleteProduct(req, res) {
  const product = await Product.findOneAndDelete({
    _id: req.params.id,
    user: req.userId,
  });
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json({ message: "Product deleted successfully" });
}