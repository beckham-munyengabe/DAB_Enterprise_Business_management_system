import ProductModel from "../models/productModel.js";

export async function list(_req, res, next) {
  try {
    res.json(await ProductModel.findAll());
  } catch (err) {
    next(err);
  }
}

export async function lowStock(_req, res, next) {
  try {
    res.json(await ProductModel.lowStock());
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    res.status(201).json(await ProductModel.create(req.body));
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    res.json(await ProductModel.update(req.params.id, req.body));
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await ProductModel.remove(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
}
