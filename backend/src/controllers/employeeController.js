import UserModel from "../models/userModel.js";

// GET /api/employees
export async function list(_req, res, next) {
  try {
    res.json(await UserModel.listAll());
  } catch (err) {
    next(err);
  }
}

const VALID_ROLES = ["admin", "sales_manager", "store_keeper"];

// POST /api/employees/:id/roles  { role }
export async function assignRole(req, res, next) {
  try {
    const { role } = req.body;
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    await UserModel.addRole(req.params.id, role);
    res.json(await UserModel.findById(req.params.id));
  } catch (err) {
    next(err);
  }
}

// DELETE /api/employees/:id/roles  { role }
export async function revokeRole(req, res, next) {
  try {
    const { role } = req.body;
    await UserModel.removeRole(req.params.id, role);
    res.json(await UserModel.findById(req.params.id));
  } catch (err) {
    next(err);
  }
}
