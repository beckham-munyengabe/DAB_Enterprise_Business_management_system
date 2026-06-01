import PurchaseModel from "../models/purchaseModel.js";

export async function list(_req, res, next) {
  try {
    res.json(await PurchaseModel.findAll());
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const purchase = await PurchaseModel.findById(req.params.id);
    if (!purchase) return res.status(404).json({ message: "Purchase not found" });
    res.json(purchase);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "At least one purchase item is required" });
    }
    const purchase = await PurchaseModel.create({
      supplier: req.body.supplier,
      received_by: req.user?.id || req.body.received_by,
      items,
    });
    res.status(201).json(purchase);
  } catch (err) {
    next(err);
  }
}
