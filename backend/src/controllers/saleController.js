import SaleModel from "../models/saleModel.js";

export async function list(_req, res, next) {
  try {
    res.json(await SaleModel.findAll());
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const sale = await SaleModel.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    res.json(sale);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "At least one sale item is required" });
    }
    const sale = await SaleModel.create({
      customer_id: req.body.customer_id,
      cashier_id: req.user?.id || req.body.cashier_id,
      items,
    });
    res.status(201).json(sale);
  } catch (err) {
    next(err);
  }
}
