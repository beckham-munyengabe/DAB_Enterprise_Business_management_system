import CategoryModel from "../models/categoryModel.js";

export async function list(_req, res, next) {
  try {
    res.json(await CategoryModel.findAll());
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const cat = await CategoryModel.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: "Category not found" });
    res.json(cat);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    res.status(201).json(await CategoryModel.create(req.body));
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    res.json(await CategoryModel.update(req.params.id, req.body));
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await CategoryModel.remove(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    next(err);
  }
}
