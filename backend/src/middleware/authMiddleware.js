import jwt from "jsonwebtoken";
import UserModel from "../models/userModel.js";

// Verifies the Bearer token and attaches the user to the request.
export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    req.user = user; // { id, full_name, email, roles: [...] }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
}

// Restricts a route to one or more roles (admin, sales_manager, store_keeper).
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    const roles = req.user?.roles || [];
    const ok = roles.includes("admin") || allowedRoles.some((r) => roles.includes(r));
    if (!ok) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  };
}
