import bcrypt from "bcryptjs";
import UserModel from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

const VALID_ROLES = ["admin", "sales_manager", "store_keeper"];

// POST /api/auth/register
// The role is chosen by the user on the register page. If none is provided,
// the very first registered account becomes an admin (everyone else is a
// sales_manager by default).
export async function register(req, res, next) {
  try {
    const { full_name, email, phone, password, role } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "full_name, email and password are required" });
    }

    const existing = await UserModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const userId = await UserModel.create({ full_name, email, phone, password_hash });

    const userCount = await UserModel.count();
    let assignedRole = VALID_ROLES.includes(role) ? role : null;
    if (!assignedRole) assignedRole = userCount === 1 ? "admin" : "sales_manager";
    await UserModel.addRole(userId, assignedRole);

    const user = await UserModel.findById(userId);
    const token = generateToken(userId);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
// An optional role can be selected on the login page. When provided, the
// account must actually have that role or the login is rejected.
export async function login(req, res, next) {
  try {
    const { email, password, role } = req.body;
    const user = await UserModel.findByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    if (role && !(user.roles || []).includes(role)) {
      return res.status(403).json({ message: "This account does not have the selected role" });
    }

    const token = generateToken(user.id);
    delete user.password_hash;
    res.json({ user, token });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
export async function me(req, res) {
  res.json({ user: req.user });
}
