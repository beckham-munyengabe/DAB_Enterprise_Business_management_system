import CustomerModel from "../models/customerModel.js";

export async function list(_req, res, next) {
  try {
    res.json(await CustomerModel.findAll());
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const customer = await CustomerModel.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) {
    next(err);
  }
}

export async function history(req, res, next) {
  try {
    res.json(await CustomerModel.history(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { full_name } = req.body;
    if (!full_name) return res.status(400).json({ message: "full_name is required" });
    res.status(201).json(await CustomerModel.create(req.body));
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    res.json(await CustomerModel.update(req.params.id, req.body));
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await CustomerModel.remove(req.params.id);
    res.json({ message: "Customer deleted" });
  } catch (err) {
    next(err);
  }
}
